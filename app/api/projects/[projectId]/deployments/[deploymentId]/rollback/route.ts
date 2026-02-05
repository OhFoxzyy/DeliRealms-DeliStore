import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { PrismaClient } from '@/generated/prisma';
import { dockerService } from '@/lib/deployment/docker-service';

const prisma = new PrismaClient();

export async function POST(
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

    if (!deployment.project.subdomain) {
      return NextResponse.json({ error: 'Project must have a subdomain' }, { status: 400 });
    }

    // Get project pages and env vars
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { pages: true, envVars: true },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    // Create new deployment from this one's state
    const newDeployment = await prisma.deployment.create({
      data: {
        projectId,
        status: 'building',
      },
    });

    // Prepare env vars
    const envVars: Record<string, string> = {};
    project.envVars.forEach(ev => {
      envVars[ev.key] = ev.value;
    });

    // Get user's subscription/plan
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });
    const userPlan = subscription?.plan || 'hobby';

    // Deploy using Docker service
    const result = await dockerService.deploy({
      projectId: project.id,
      projectName: project.name,
      subdomain: project.subdomain!,
      envVars,
      pages: project.pages.map(p => ({
        slug: p.slug,
        content: p.content,
        code: p.code,
      })),
      port: 3000,
      plan: userPlan,
    });

    if (result.success) {
      await prisma.deployment.update({
        where: { id: newDeployment.id },
        data: {
          status: 'active',
          containerId: result.containerId,
          url: result.url,
        },
      });

      return NextResponse.json({
        success: true,
        deployment: {
          id: newDeployment.id,
          url: result.url,
        },
      });
    } else {
      await prisma.deployment.update({
        where: { id: newDeployment.id },
        data: { status: 'failed' },
      });

      return NextResponse.json(
        { error: result.error || 'Rollback failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[rollback] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

