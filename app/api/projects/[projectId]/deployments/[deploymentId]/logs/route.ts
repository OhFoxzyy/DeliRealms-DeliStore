import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { PrismaClient } from '@/generated/prisma';
import { dockerService } from '@/lib/deployment/docker-service';

const prisma = new PrismaClient();

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ projectId: string; deploymentId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const { projectId, deploymentId } = await params;

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const deployment = await prisma.deployment.findFirst({
      where: {
        id: deploymentId,
        projectId,
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
    const lines = rawLogs.split('\n').filter(Boolean).map(line => {
      // Format backend logs with [VIXLE] prefix if not already present
      if (line.includes('[v0]') || line.includes('[VIXLE]')) {
        return line.replace(/\[v0\]/g, '[VIXLE]');
      }
      // Add timestamp to other logs if not present
      if (!line.match(/^\d{2}:\d{2}:\d{2}\.\d{3}/)) {
        const now = new Date();
        const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
        return `${timestamp}  ${line}`;
      }
      return line;
    });

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

