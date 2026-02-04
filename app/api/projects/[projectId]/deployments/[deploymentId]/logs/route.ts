import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { PrismaClient } from '@/generated/prisma';
import { dockerService } from '@/lib/deployment/docker-service';

const prisma = new PrismaClient();

export async function GET(
  _req: NextRequest,
  { params }: { params: { projectId: string; deploymentId: string } },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deployment = await prisma.deployment.findFirst({
      where: {
        id: params.deploymentId,
        projectId: params.projectId,
        project: {
          userId: session.user.id,
        },
      },
    });

    if (!deployment) {
      return NextResponse.json({ error: 'Deployment not found' }, { status: 404 });
    }

    if (!deployment.containerId) {
      return NextResponse.json({
        lines: [],
        status: deployment.status,
      });
    }

    const rawLogs = await dockerService.getLogs(deployment.containerId);
    const lines = rawLogs.split('\n').filter(Boolean);

    return NextResponse.json({
      status: deployment.status,
      lines,
    });
  } catch (error) {
    console.error('[deployment-logs] GET error', error);
    return NextResponse.json(
      { error: 'Failed to load logs' },
      { status: 500 },
    );
  }
}

