import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { PrismaClient } from '@/generated/prisma';
import { dockerService } from '@/lib/deployment/docker-service';

const prisma = new PrismaClient();

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ projectId: string; deploymentId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId, deploymentId } = await params;

    const deployment = await prisma.deployment.findFirst({
      where: {
        id: deploymentId,
        projectId,
        project: { userId: session.user.id },
      },
      include: { project: true },
    });

    if (!deployment) {
      return NextResponse.json({ error: 'Deployment not found' }, { status: 404 });
    }

    // Stop and remove container if it exists
    if (deployment.containerId) {
      const imageName = deployment.project.subdomain ? `vixle-${deployment.project.subdomain}` : null;
      if (imageName) {
        try {
          await dockerService.undeploy(projectId, deployment.project.subdomain!);
        } catch (error) {
          console.error('[delete-deployment] Error undeploying:', error);
        }
      }
    }

    // Delete deployment record
    await prisma.deployment.delete({
      where: { id: deploymentId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[delete-deployment] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

