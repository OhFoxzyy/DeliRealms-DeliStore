import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { PrismaClient } from '@/generated/prisma';
import { dockerService } from '@/lib/deployment/docker-service';

const prisma = new PrismaClient();

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;

    // Get user's subscription/plan
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });
    const userPlan = subscription?.plan || 'hobby';

    // Get project with pages and env vars
    const project = await prisma.project.findUnique({
      where: { id: projectId, userId: session.user.id },
      include: {
        pages: true,
        envVars: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (!project.subdomain) {
      return NextResponse.json({ error: 'Project must have a subdomain' }, { status: 400 });
    }

    // Create deployment record first
    const deployment = await prisma.deployment.create({
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

    // Deploy using Docker service
    const result = await dockerService.deploy({
      projectId: project.id,
      projectName: project.name,
      subdomain: project.subdomain,
      envVars,
      pages: project.pages.map(p => ({
        slug: p.slug,
        content: p.content,
        code: p.code,
      })),
      port: 3000, // Not used anymore, but kept for compatibility
      plan: userPlan,
    });

    if (result.success) {
      // Update deployment
      try {
        await prisma.deployment.update({
          where: { id: deployment.id },
          data: {
            status: 'active',
            containerId: result.containerId,
            url: result.url,
          },
        });

        // Update project
        await prisma.project.update({
          where: { id: projectId },
          data: { isPublished: true },
        });

        return NextResponse.json({
          success: true,
          deployment: {
            id: deployment.id,
            url: result.url,
            containerId: result.containerId,
          },
        });
      } catch (updateError) {
        console.error('[v0] Error updating deployment:', updateError);
        // Deployment succeeded but update failed - still return success
        return NextResponse.json({
          success: true,
          deployment: {
            id: deployment.id,
            url: result.url,
            containerId: result.containerId,
          },
        });
      }
    } else {
      // Update deployment as failed
      try {
        await prisma.deployment.update({
          where: { id: deployment.id },
          data: { status: 'failed' },
        });
      } catch (updateError) {
        console.error('[v0] Error updating failed deployment:', updateError);
      }

      return NextResponse.json(
        { error: result.error || 'Deployment failed' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[VIXLE] Deployment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { projectId } = await params;

    const project = await prisma.project.findUnique({
      where: { id: projectId, userId: session.user.id },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    if (!project.subdomain) {
      return NextResponse.json({ error: 'No subdomain configured' }, { status: 400 });
    }

    // Undeploy
    await dockerService.undeploy(projectId, project.subdomain);

    // Update deployments
    await prisma.deployment.updateMany({
      where: { projectId, status: 'active' },
      data: { status: 'inactive' },
    });

    // Update project
    await prisma.project.update({
      where: { id: projectId },
      data: { isPublished: false },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[v0] Undeployment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
