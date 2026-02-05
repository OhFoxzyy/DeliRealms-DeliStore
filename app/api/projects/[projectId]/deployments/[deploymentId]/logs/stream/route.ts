import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { PrismaClient } from '@/generated/prisma';
import { dockerService } from '@/lib/deployment/docker-service';

const prisma = new PrismaClient();

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string; deploymentId: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    const { projectId, deploymentId } = await params;

    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
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
      return new Response('Deployment not found', { status: 404 });
    }

    // Create a readable stream for Server-Sent Events
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();

        const sendEvent = (data: string, event?: string) => {
          const eventLine = event ? `event: ${event}\n` : '';
          const dataLines = data.split('\n').map(line => `data: ${line}\n`).join('');
          controller.enqueue(encoder.encode(`${eventLine}${dataLines}\n\n`));
        };

        // Send initial logs if container exists
        if (deployment.containerId) {
          try {
            const initialLogs = await dockerService.getLogs(deployment.containerId, 100);
            const formattedLogs = initialLogs.split('\n').filter(Boolean).map(line => {
              if (line.includes('[v0]') || line.includes('[VIXLE]')) {
                return line.replace(/\[v0\]/g, '[VIXLE]');
              }
              if (!line.match(/^\d{2}:\d{2}:\d{2}\.\d{3}/)) {
                const now = new Date();
                const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
                return `${timestamp}  ${line}`;
              }
              return line;
            }).join('\n');
            sendEvent(formattedLogs, 'logs');
          } catch (error) {
            sendEvent(`[VIXLE] Error fetching initial logs: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
          }

          // Stream live logs
          dockerService.streamLogs(
            deployment.containerId,
            (data) => {
              const formatted = data.split('\n').filter(Boolean).map(line => {
                if (line.includes('[v0]') || line.includes('[VIXLE]')) {
                  return line.replace(/\[v0\]/g, '[VIXLE]');
                }
                if (!line.match(/^\d{2}:\d{2}:\d{2}\.\d{3}/)) {
                  const now = new Date();
                  const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
                  return `${timestamp}  ${line}`;
                }
                return line;
              }).join('\n');
              sendEvent(formatted, 'logs');
            },
            (error) => {
              sendEvent(`[VIXLE] Error streaming logs: ${error.message}`, 'error');
            }
          );
        } else {
          // No container yet, poll for container creation
          const pollInterval = setInterval(async () => {
            const updatedDeployment = await prisma.deployment.findUnique({
              where: { id: deploymentId },
            });

            if (updatedDeployment?.containerId) {
              clearInterval(pollInterval);
              try {
                const logs = await dockerService.getLogs(updatedDeployment.containerId, 100);
                const formattedLogs = logs.split('\n').filter(Boolean).map(line => {
                  if (line.includes('[v0]') || line.includes('[VIXLE]')) {
                    return line.replace(/\[v0\]/g, '[VIXLE]');
                  }
                  if (!line.match(/^\d{2}:\d{2}:\d{2}\.\d{3}/)) {
                    const now = new Date();
                    const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
                    return `${timestamp}  ${line}`;
                  }
                  return line;
                }).join('\n');
                sendEvent(formattedLogs, 'logs');
                
                dockerService.streamLogs(
                  updatedDeployment.containerId,
                  (data) => {
                    const formatted = data.split('\n').filter(Boolean).map(line => {
                      if (line.includes('[v0]') || line.includes('[VIXLE]')) {
                        return line.replace(/\[v0\]/g, '[VIXLE]');
                      }
                      if (!line.match(/^\d{2}:\d{2}:\d{2}\.\d{3}/)) {
                        const now = new Date();
                        const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;
                        return `${timestamp}  ${line}`;
                      }
                      return line;
                    }).join('\n');
                    sendEvent(formatted, 'logs');
                  },
                  (error) => {
                    sendEvent(`[VIXLE] Error streaming logs: ${error.message}`, 'error');
                  }
                );
              } catch (error) {
                sendEvent(`Error fetching logs: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
              }
            }
          }, 1000);

          // Clean up interval on close
          req.signal.addEventListener('abort', () => {
            clearInterval(pollInterval);
          });
        }

        // Keep connection alive
        const keepAliveInterval = setInterval(() => {
          sendEvent('', 'ping');
        }, 30000);

        req.signal.addEventListener('abort', () => {
          clearInterval(keepAliveInterval);
          controller.close();
        });
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('[deployment-logs-stream] GET error', error);
    return new Response('Failed to stream logs', { status: 500 });
  }
}

