import { redirect, notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { PrismaClient } from '@/generated/prisma';
import { ProjectTabs } from '@/components/dashboard/project-tabs';
import { DeploymentsList } from '@/components/deployments/deployments-list';

const prisma = new PrismaClient();

export default async function DeploymentsPage({
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
    include: {
      deployments: {
        orderBy: { createdAt: 'desc' },
      },
    },
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
            <h1 className="text-3xl font-bold">Deployments</h1>
            <p className="text-muted-foreground mt-2">
              View and manage your project deployments
            </p>
          </div>

          <DeploymentsList
            projectId={project.id}
            deployments={project.deployments}
            isPublished={project.isPublished}
          />
        </div>
      </div>
    </div>
  );
}
