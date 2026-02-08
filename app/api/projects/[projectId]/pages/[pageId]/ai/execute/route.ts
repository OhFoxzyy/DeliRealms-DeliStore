import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { prisma } from '@/lib/prisma/get-pool';
import { z } from 'zod';

const bodySchema = z.object({
  action: z.object({
    id: z.string(),
    type: z.enum(['create_component', 'remove_component', 'modify_component', 'create_page', 'delete_page', 'modify_theme', 'modify_styles']),
    description: z.string(),
    data: z.any().optional(),
  }),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ projectId: string; pageId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { projectId, pageId } = await params;

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId, userId: session.user.id },
    });

    if (!project) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }

    const body = await req.json();
    const { action } = bodySchema.parse(body);

    // Execute the action based on type
    switch (action.type) {
      case 'create_component': {
        const page = await prisma.page.findFirst({
          where: { id: pageId, projectId },
        });

        if (!page) {
          return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }

        const currentElements = (page.elements as any[]) || [];
        const newElements = [...currentElements, ...(action.data?.elements || [])];

        await prisma.page.update({
          where: { id: pageId },
          data: { elements: newElements },
        });

        return NextResponse.json({ success: true, message: 'Component created' });
      }

      case 'remove_component': {
        const page = await prisma.page.findFirst({
          where: { id: pageId, projectId },
        });

        if (!page) {
          return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }

        const currentElements = (page.elements as any[]) || [];
        const newElements = currentElements.filter(
          (el: any) => el.id !== action.data?.componentId
        );

        await prisma.page.update({
          where: { id: pageId },
          data: { elements: newElements },
        });

        return NextResponse.json({ success: true, message: 'Component removed' });
      }

      case 'modify_component': {
        const page = await prisma.page.findFirst({
          where: { id: pageId, projectId },
        });

        if (!page) {
          return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }

        const currentElements = (page.elements as any[]) || [];
        const newElements = currentElements.map((el: any) => {
          if (el.id === action.data?.componentId) {
            return { ...el, ...action.data?.updates };
          }
          return el;
        });

        await prisma.page.update({
          where: { id: pageId },
          data: { elements: newElements },
        });

        return NextResponse.json({ success: true, message: 'Component modified' });
      }

      case 'create_page': {
        const newPage = await prisma.page.create({
          data: {
            title: action.data?.title || 'New Page',
            path: action.data?.path || `/page-${Date.now()}`,
            projectId,
            elements: action.data?.elements || [],
            settings: action.data?.settings || {},
          },
        });

        return NextResponse.json({ 
          success: true, 
          message: 'Page created',
          pageId: newPage.id 
        });
      }

      case 'delete_page': {
        await prisma.page.delete({
          where: { id: action.data?.pageId },
        });

        return NextResponse.json({ success: true, message: 'Page deleted' });
      }

      case 'modify_theme': {
        const page = await prisma.page.findFirst({
          where: { id: pageId, projectId },
        });

        if (!page) {
          return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }

        const currentSettings = (page.settings as any) || {};
        const newSettings = {
          ...currentSettings,
          theme: action.data?.theme,
        };

        await prisma.page.update({
          where: { id: pageId },
          data: { settings: newSettings },
        });

        return NextResponse.json({ success: true, message: 'Theme modified' });
      }

      case 'modify_styles': {
        const page = await prisma.page.findFirst({
          where: { id: pageId, projectId },
        });

        if (!page) {
          return NextResponse.json({ error: 'Page not found' }, { status: 404 });
        }

        const currentSettings = (page.settings as any) || {};
        const newSettings = {
          ...currentSettings,
          customStyles: action.data?.styles,
        };

        await prisma.page.update({
          where: { id: pageId },
          data: { settings: newSettings },
        });

        return NextResponse.json({ success: true, message: 'Styles modified' });
      }

      default:
        return NextResponse.json({ error: 'Unknown action type' }, { status: 400 });
    }
  } catch (error) {
    console.error('[v0] AI execute error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to execute action' },
      { status: 500 }
    );
  }
}
