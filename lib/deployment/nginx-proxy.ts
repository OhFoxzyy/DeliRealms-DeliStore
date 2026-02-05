import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

export class NginxProxyService {
  private nginxContainerName = 'vixle-nginx-proxy';
  private nginxConfigDir: string;
  private nginxNetworkName = 'vixle-network';

  constructor() {
    // Use a local directory for nginx configs instead of /etc/nginx
    this.nginxConfigDir = path.join(os.tmpdir(), 'vixle-nginx-configs');
  }

  async ensureNginxProxyRunning(): Promise<void> {
    try {
      // Check if network exists
      try {
        await execAsync(`docker network inspect ${this.nginxNetworkName}`);
      } catch {
        // Network doesn't exist, create it
        await execAsync(`docker network create ${this.nginxNetworkName}`);
      }

      // Check if nginx container exists and is running
      try {
        const { stdout: runningContainers } = await execAsync(`docker ps --filter name=${this.nginxContainerName} --format "{{.Names}}"`);
        if (runningContainers.trim() === this.nginxContainerName) {
          return; // Already running
        }
      } catch {
        // Container not running, check if it exists
      }

      // Check if container exists but is stopped
      try {
        const { stdout: allContainers } = await execAsync(`docker ps -a --filter name=${this.nginxContainerName} --format "{{.Names}}"`);
        if (allContainers.trim() === this.nginxContainerName) {
          // Container exists but is stopped, start it
          console.log('[nginx-proxy] Starting existing nginx container');
          await execAsync(`docker start ${this.nginxContainerName}`);
          // Wait a bit for nginx to start
          await new Promise(resolve => setTimeout(resolve, 2000));
          return;
        }
      } catch {
        // Container doesn't exist, will create new one
      }

      // Ensure config directory exists
      await fs.mkdir(this.nginxConfigDir, { recursive: true });

      // Create nginx.conf
      const nginxConf = await this.generateNginxConfig();
      await fs.writeFile(path.join(this.nginxConfigDir, 'nginx.conf'), nginxConf);

      // Stop and remove existing container if it exists
      try {
        await execAsync(`docker stop ${this.nginxContainerName} || true`);
        await execAsync(`docker rm ${this.nginxContainerName} || true`);
      } catch {
        // Ignore errors
      }

      // Start nginx proxy container
      // Use absolute path for volume mounting
      const absoluteConfigDir = path.resolve(this.nginxConfigDir);
      const isWindows = process.platform === 'win32';
      
      // On Windows, Docker Desktop requires forward slashes and proper path format
      let volumePath = absoluteConfigDir;
      if (isWindows) {
        // Convert Windows path to Docker volume path
        volumePath = absoluteConfigDir.replace(/\\/g, '/');
        if (volumePath.match(/^[A-Z]:/)) {
          volumePath = volumePath.replace(/^([A-Z]):/, '/$1').toLowerCase();
        }
      }

      await execAsync(
        `docker run -d ` +
        `--name ${this.nginxContainerName} ` +
        `--network ${this.nginxNetworkName} ` +
        `-p 80:80 ` +
        `-v "${volumePath}:/etc/nginx/conf.d:ro" ` +
        `nginx:alpine`
      );

      console.log('[nginx-proxy] Nginx proxy container started');
    } catch (error) {
      console.error('[nginx-proxy] Error ensuring nginx proxy:', error);
      throw error;
    }
  }

  async addUpstream(subdomain: string, containerName: string): Promise<void> {
    await this.ensureNginxProxyRunning();

    const config = `upstream ${subdomain} {
    server ${containerName}:3000;
}

server {
    listen 80;
    server_name ${subdomain}.vixle.app;

    location / {
        proxy_pass http://${subdomain};
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
`;

    const configPath = path.join(this.nginxConfigDir, `${subdomain}.conf`);
    await fs.writeFile(configPath, config);

    // Reload nginx
    await this.reloadNginx();
  }

  async removeUpstream(subdomain: string): Promise<void> {
    const configPath = path.join(this.nginxConfigDir, `${subdomain}.conf`);
    try {
      await fs.unlink(configPath);
      await this.reloadNginx();
    } catch {
      // Ignore if file doesn't exist
    }
  }

  private async reloadNginx(): Promise<void> {
    try {
      // Ensure container is running first
      await this.ensureNginxProxyRunning();
      await execAsync(`docker exec ${this.nginxContainerName} nginx -s reload`);
    } catch (error) {
      console.error('[nginx-proxy] Error reloading nginx:', error);
      // Try to restart container if reload fails
      try {
        await this.ensureNginxProxyRunning();
        await execAsync(`docker restart ${this.nginxContainerName}`);
        // Wait for restart
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch {
        // Ignore restart errors
      }
    }
  }

  private async generateNginxConfig(): Promise<string> {
    return `events {
    worker_connections 1024;
}

http {
    include /etc/nginx/conf.d/*.conf;
    
    # Default server for unmatched domains
    server {
        listen 80 default_server;
        server_name _;
        return 404;
    }
}
`;
  }
}

export const nginxProxyService = new NginxProxyService();

