import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export interface DeploymentConfig {
  projectId: string;
  projectName: string;
  subdomain: string;
  envVars: Record<string, string>;
  pages: Array<{ slug: string; content: string; code?: string | null }>;
  port: number;
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
  private baseDir = '/tmp/deployments';
  private nginxConfigDir = '/etc/nginx/sites-enabled/deployments';

  async deploy(config: DeploymentConfig): Promise<{ success: boolean; containerId?: string; url?: string; error?: string }> {
    try {
      console.log('[v0] Starting deployment for project:', config.projectId);
      
      // Create project directory
      const projectDir = path.join(this.baseDir, config.projectId);
      await fs.mkdir(projectDir, { recursive: true });

      // Generate Next.js project files
      await this.generateProjectFiles(projectDir, config);

      // Create Dockerfile
      await this.createDockerfile(projectDir);

      // Build Docker image
      const imageName = `vixle-${config.subdomain}`;
      console.log('[v0] Building Docker image:', imageName);
      await execAsync(`docker build -t ${imageName} ${projectDir}`);

      // Stop and remove existing container if exists
      try {
        await execAsync(`docker stop ${imageName} || true`);
        await execAsync(`docker rm ${imageName} || true`);
      } catch (e) {
        // Ignore if container doesn't exist
      }

      // Run Docker container
      const envVarsString = Object.entries(config.envVars)
        .map(([key, value]) => `-e ${key}="${value}"`)
        .join(' ');

      console.log('[v0] Starting Docker container on port:', config.port);
      const { stdout: containerId } = await execAsync(
        `docker run -d --name ${imageName} -p ${config.port}:3000 ${envVarsString} ${imageName}`
      );

      // Configure Nginx reverse proxy
      await this.configureNginx(config.subdomain, config.port);

      const url = `https://${config.subdomain}.vixle.app`;
      console.log('[v0] Deployment successful. URL:', url);

      return {
        success: true,
        containerId: containerId.trim(),
        url,
      };
    } catch (error) {
      console.error('[v0] Deployment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown deployment error',
      };
    }
  }

  async undeploy(projectId: string, subdomain: string): Promise<{ success: boolean; error?: string }> {
    try {
      const imageName = `vixle-${subdomain}`;
      
      // Stop and remove container
      await execAsync(`docker stop ${imageName} || true`);
      await execAsync(`docker rm ${imageName} || true`);
      
      // Remove image
      await execAsync(`docker rmi ${imageName} || true`);
      
      // Remove Nginx config
      await this.removeNginxConfig(subdomain);
      
      // Clean up project directory
      const projectDir = path.join(this.baseDir, projectId);
      await fs.rm(projectDir, { recursive: true, force: true });

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

  private async configureNginx(subdomain: string, port: number): Promise<void> {
    const nginxConfig = `server {
    listen 80;
    server_name ${subdomain}.vixle.app;

    location / {
        proxy_pass http://localhost:${port};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}`;

    const configPath = path.join(this.nginxConfigDir, `${subdomain}.vixle.app.conf`);
    await fs.writeFile(configPath, nginxConfig);
    
    // Reload Nginx
    await execAsync('nginx -s reload');
  }

  private async removeNginxConfig(subdomain: string): Promise<void> {
    const configPath = path.join(this.nginxConfigDir, `${subdomain}.vixle.app.conf`);
    await fs.unlink(configPath).catch(() => {});
    await execAsync('nginx -s reload').catch(() => {});
  }

  async getLogs(containerId: string): Promise<string> {
    try {
      const { stdout } = await execAsync(`docker logs ${containerId} --tail 100`);
      return stdout;
    } catch (error) {
      return `Error fetching logs: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
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
