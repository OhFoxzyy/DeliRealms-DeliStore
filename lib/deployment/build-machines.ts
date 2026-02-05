export interface BuildMachineConfig {
  name: string;
  vcpus: number;
  ram: number; // GB
  functionalVcpus: number;
  functionalRam: number; // GB
  storagePerDeployment: number; // GB
}

export const BUILD_MACHINES: Record<string, BuildMachineConfig> = {
  hobby: {
    name: 'Hobby',
    vcpus: 2,
    ram: 4,
    functionalVcpus: 1,
    functionalRam: 2,
    storagePerDeployment: 5,
  },
  pro: {
    name: 'Pro',
    vcpus: 4,
    ram: 8,
    functionalVcpus: 2,
    functionalRam: 4,
    storagePerDeployment: 10,
  },
  enterprise: {
    name: 'Enterprise',
    vcpus: 8,
    ram: 16,
    functionalVcpus: 4,
    functionalRam: 8,
    storagePerDeployment: 20,
  },
};

export function getBuildMachineConfig(plan: string): BuildMachineConfig {
  return BUILD_MACHINES[plan.toLowerCase()] || BUILD_MACHINES.hobby;
}

export function generateDockerRunCommand(
  imageName: string,
  config: BuildMachineConfig,
  envVars: Record<string, string>,
  networkName: string
): string {
  const envVarsString = Object.entries(envVars)
    .map(([key, value]) => `-e ${key}="${value.replace(/"/g, '\\"')}"`)
    .join(' ');

  const deploymentsUrl = process.env.DEPLOYMENTS_URL || 'http://localhost:3000';
  const fullEnvVarsString = `${envVarsString} -e DEPLOYMENTS_URL="${deploymentsUrl}"`;

  // Docker resource limits
  const memoryLimit = `${config.functionalRam * 1024}m`; // Convert GB to MB
  const cpuLimit = config.functionalVcpus.toString();

  return `docker run -d ` +
    `--name ${imageName} ` +
    `--network ${networkName} ` +
    `--memory ${memoryLimit} ` +
    `--cpus ${cpuLimit} ` +
    `${fullEnvVarsString} ` +
    `${imageName}`;
}

