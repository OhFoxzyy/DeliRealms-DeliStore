import { redirect, notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { PrismaClient } from '@/generated/prisma';
import { ProjectTabs } from '@/components/dashboard/project-tabs';
import { DomainManager } from '@/components/domains/domain-manager';

const prisma = new PrismaClient();

export default async function DomainsPage({
  params,
}: {
  params: { projectId: string };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/signin');
  }

  const project = await prisma.project.findUnique({
    where: { id: params.projectId },
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
            <h1 className="text-3xl font-bold">Domains</h1>
            <p className="text-muted-foreground mt-2">
              Manage your project domains and deployment URLs
            </p>
          </div>

          <DomainManager
            projectId={project.id}
            subdomain={project.subdomain}
            customDomain={project.customDomain}
          />
        </div>
      </div>
    </div>
  );
}
