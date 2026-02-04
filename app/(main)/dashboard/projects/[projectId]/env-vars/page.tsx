import { redirect, notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { PrismaClient } from '@/generated/prisma';
import { ProjectTabs } from '@/components/dashboard/project-tabs';
import { EnvVarsManager } from '@/components/env-vars/env-vars-manager';

const prisma = new PrismaClient();

export default async function EnvVarsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/signin');
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { envVars: true },
  });

  if (!project || project.userId !== session.user.id) {
    notFound();
  }

  return (
    <div className="flex flex-col">
      <ProjectTabs projectId={project.id} projectName={project.name} />
      <div className="container py-8 px-4">
        <div className="max-w-4xl">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Environment Variables</h1>
            <p className="text-muted-foreground mt-2">
              Securely store API keys and configuration values for your project
            </p>
          </div>

          <EnvVarsManager
            projectId={project.id}
            initialEnvVars={project.envVars.map(ev => ({
              id: ev.id,
              key: ev.key,
              value: ev.value,
            }))}
          />
        </div>
      </div>
    </div>
  );
}
