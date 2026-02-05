import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { nginxProxyService } from './nginx-proxy';
import { getBuildMachineConfig, generateDockerRunCommand } from './build-machines';

const execAsync = promisify(exec);

export interface DeploymentConfig {
  projectId: string;
  projectName: string;
  subdomain: string;
  envVars: Record<string, string>;
  pages: Array<{ slug: string; content: string; code?: string | null }>;
  port: number;
  plan?: string;
}

export interface PageElement {
  type: 'heading' | 'text' | 'button' | 'image' | 'container';
  content?: {
    level?: number;
    text?: string;
    src?: string;
    alt?: string;
  };
  styles?: Record<string, string>;
  children?: PageElement[];
}

export class DockerDeploymentService {
  private baseDir: string;
  private nginxNetworkName = 'vixle-network';

  constructor() {
    // Use OS temp directory instead of hardcoded /tmp
    this.baseDir = path.join(os.tmpdir(), 'vixle-deployments');
  }

  async deploy(config: DeploymentConfig): Promise<{ success: boolean; containerId?: string; url?: string; error?: string }> {
    try {
      const plan = config.plan || 'hobby';
      const buildConfig = getBuildMachineConfig(plan);
      
      console.log('[VIXLE] Starting deployment for project:', config.projectId);
      console.log('[VIXLE] Using build machine:', buildConfig.name, `(${buildConfig.functionalVcpus} vCPU, ${buildConfig.functionalRam}GB RAM)`);
      
      // Create project directory
      const projectDir = path.join(this.baseDir, config.projectId);
      await fs.mkdir(projectDir, { recursive: true });

      // Generate Next.js project files
      await this.generateProjectFiles(projectDir, config);

      // Create Dockerfile
      await this.createDockerfile(projectDir);

      // Build Docker image
      const imageName = `vixle-${config.subdomain}`;
      console.log('[VIXLE] Building Docker image:', imageName);
      await execAsync(`docker build -t ${imageName} ${projectDir}`);

      // Stop and remove existing container if exists
      try {
        await execAsync(`docker stop ${imageName} || true`);
        await execAsync(`docker rm ${imageName} || true`);
      } catch (e) {
        // Ignore if container doesn't exist
      }

      // Find available port
      const port = await this.findAvailablePort();

      // Ensure nginx network exists
      try {
        await execAsync(`docker network inspect ${this.nginxNetworkName}`);
      } catch {
        await execAsync(`docker network create ${this.nginxNetworkName}`);
      }

      // Run Docker container on nginx network (no port mapping needed)
      const envVarsString = Object.entries(config.envVars)
        .map(([key, value]) => `-e ${key}="${value.replace(/"/g, '\\"')}"`)
        .join(' ');

      const deploymentsUrl = process.env.DEPLOYMENTS_URL || 'http://localhost:3000';
      const fullEnvVarsString = `${envVarsString} -e DEPLOYMENTS_URL="${deploymentsUrl}"`;

      console.log('[VIXLE] Starting Docker container:', imageName);
      
      // Stop and remove existing container if exists
      try {
        await execAsync(`docker stop ${imageName} 2>nul || docker stop ${imageName} 2>/dev/null || true`);
        await execAsync(`docker rm ${imageName} 2>nul || docker rm ${imageName} 2>/dev/null || true`);
      } catch (e) {
        // Ignore if container doesn't exist
      }

      // Use build machine config for resource limits
      const dockerRunCommand = generateDockerRunCommand(
        imageName,
        buildConfig,
        config.envVars,
        this.nginxNetworkName
      );

      const { stdout: containerId } = await execAsync(dockerRunCommand);

      // Configure Nginx reverse proxy
      await nginxProxyService.addUpstream(config.subdomain, imageName);

      const url = `https://${config.subdomain}.vixle.app`;
      console.log('[VIXLE] Deployment successful. URL:', url);

      return {
        success: true,
        containerId: containerId.trim(),
        url,
      };
    } catch (error) {
      console.error('[VIXLE] Deployment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown deployment error',
      };
    }
  }

  async undeploy(projectId: string, subdomain: string): Promise<{ success: boolean; error?: string }> {
    try {
      const imageName = `vixle-${subdomain}`;
      
      // Remove Nginx config first
      await nginxProxyService.removeUpstream(subdomain);
      
      // Stop and remove container
      try {
        await execAsync(`docker stop ${imageName} 2>nul || docker stop ${imageName} 2>/dev/null || true`);
        await execAsync(`docker rm ${imageName} 2>nul || docker rm ${imageName} 2>/dev/null || true`);
      } catch {
        // Ignore errors
      }
      
      // Remove image (optional, keep for cleanup)
      try {
        await execAsync(`docker rmi ${imageName} 2>nul || docker rmi ${imageName} 2>/dev/null || true`);
      } catch {
        // Ignore errors
      }
      
      // Clean up project directory
      const projectDir = path.join(this.baseDir, projectId);
      try {
        await fs.rm(projectDir, { recursive: true, force: true });
      } catch {
        // Ignore errors
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown undeployment error',
      };
    }
  }

  private async generateProjectFiles(projectDir: string, config: DeploymentConfig): Promise<void> {
    // package.json
    const packageJson = {
      name: config.projectName.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      scripts: {
        dev: 'next dev',
        build: 'next build',
        start: 'next start',
      },
      dependencies: {
        next: '16.1.6',
        react: '19.2.3',
        'react-dom': '19.2.3',
        stripe: config.envVars.STRIPE_SECRET_KEY ? '^17.5.0' : undefined,
      },
    };
    await fs.writeFile(
      path.join(projectDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // next.config.js
    await fs.writeFile(
      path.join(projectDir, 'next.config.js'),
      `module.exports = { reactStrictMode: true };`
    );

    // Create app directory
    const appDir = path.join(projectDir, 'app');
    await fs.mkdir(appDir, { recursive: true });

    // Generate pages
    for (const page of config.pages) {
      const pageDir = page.slug === 'home' 
        ? appDir 
        : path.join(appDir, page.slug);
      
      await fs.mkdir(pageDir, { recursive: true });
      const code =
        page.code && page.code.trim().length > 0
          ? page.code
          : this.generatePageComponent(page.content);

      await fs.writeFile(
        path.join(pageDir, 'page.tsx'),
        code
      );
    }

    // layout.tsx
    await fs.writeFile(
      path.join(appDir, 'layout.tsx'),
      this.generateLayoutComponent()
    );

    // globals.css
    await fs.writeFile(
      path.join(appDir, 'globals.css'),
      '@tailwind base;\n@tailwind components;\n@tailwind utilities;'
    );

    // tsconfig.json
    const tsConfig = {
      compilerOptions: {
        target: 'es5',
        lib: ['dom', 'dom.iterable', 'esnext'],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        noEmit: true,
        esModuleInterop: true,
        module: 'esnext',
        moduleResolution: 'bundler',
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: 'preserve',
        incremental: true,
        paths: {
          '@/*': ['./*'],
        },
      },
      include: ['next-env.d.ts', '**/*.ts', '**/*.tsx'],
      exclude: ['node_modules'],
    };
    await fs.writeFile(
      path.join(projectDir, 'tsconfig.json'),
      JSON.stringify(tsConfig, null, 2)
    );
  }

  private generatePageComponent(content: string): string {
    // Parse the JSON content and generate React component
    try {
      const elements = JSON.parse(content);
      return `export default function Page() {
  return (
    <div className="min-h-screen">
      ${this.renderElements(elements)}
    </div>
  );
}`;
    } catch {
      return `export default function Page() {
  return <div className="min-h-screen p-8">Page content</div>;
}`;
    }
  }

  private renderElements(elements: PageElement[]): string {
    if (!Array.isArray(elements)) return '';
    
    return elements.map(el => {
      const styles = el.styles || {};
      const className = Object.entries(styles)
        .map(([key, value]) => `${key}-[${value}]`)
        .join(' ');

      switch (el.type) {
        case 'heading':
          return `<h${el.content?.level || 1} className="${className}">${el.content?.text || ''}</h${el.content?.level || 1}>`;
        case 'text':
          return `<p className="${className}">${el.content?.text || ''}</p>`;
        case 'button':
          return `<button className="${className}">${el.content?.text || 'Button'}</button>`;
        case 'image':
          return `<img src="${el.content?.src || ''}" alt="${el.content?.alt || ''}" className="${className}" />`;
        case 'container':
          return `<div className="${className}">${this.renderElements(el.children || [])}</div>`;
        default:
          return '';
      }
    }).join('\n');
  }

  private generateLayoutComponent(): string {
    return `export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`;
  }

  private async createDockerfile(projectDir: string): Promise<void> {
    const dockerfile = `FROM node:20-alpine

WORKDIR /app

COPY package.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]`;

    await fs.writeFile(path.join(projectDir, 'Dockerfile'), dockerfile);
  }

  private async findAvailablePort(): Promise<number> {
    // Port is no longer needed since we use Docker networking
    // But keeping this for backwards compatibility
    return 3000;
  }

  async getLogs(containerId: string, tail: number = 100, follow: boolean = false): Promise<string> {
    try {
      const { stdout } = await execAsync(`docker logs ${containerId} --tail ${tail}${follow ? ' --follow' : ''}`);
      return stdout;
    } catch (error) {
      return `Error fetching logs: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  async streamLogs(containerId: string, onData: (data: string) => void, onError: (error: Error) => void): Promise<void> {
    const child = spawn('docker', ['logs', containerId, '--follow', '--tail', '100'], {
      shell: process.platform === 'win32',
    });

    child.stdout?.on('data', (data) => {
      onData(data.toString());
    });

    child.stderr?.on('data', (data) => {
      onData(data.toString());
    });

    child.on('error', (error) => {
      onError(error);
    });

    child.on('close', () => {
      // Stream ended
    });
  }

  async getContainerStatus(containerId: string): Promise<string> {
    try {
      const { stdout } = await execAsync(`docker inspect -f '{{.State.Status}}' ${containerId}`);
      return stdout.trim();
    } catch {
      return 'not found';
    }
  }
}

export const dockerService = new DockerDeploymentService();
