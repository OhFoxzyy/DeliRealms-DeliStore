import { redirect, notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { PrismaClient } from '@/generated/prisma';
import { AIEditorPage } from '@/components/page-builder/ai-editor-page';
import type { PageData, PageTheme } from '@/lib/page-builder/types';

const prisma = new PrismaClient();

interface PageParams {
  projectId: string;
  pageId: string;
}

export default async function AIEditorRoute({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const session = await getServerSession(authOptions);
  const { projectId, pageId } = await params;

  if (!session?.user) {
    redirect('/login');
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId: session.user.id },
  });

  if (!project) {
    notFound();
  }

  const page = await prisma.page.findFirst({
    where: { id: pageId, projectId },
  });

  if (!page) {
    notFound();
  }

  let initialElements: PageData['elements'] = [];
  let initialTheme: PageTheme | null = null;

  if (page.content) {
    try {
      const content = JSON.parse(page.content);
      initialElements = content.elements || [];
      initialTheme = content.globalStyles?.theme || null;
    } catch (error) {
      console.error('[v0] Failed to parse page content:', error);
    }
  }

  const pages = await prisma.page.findMany({
    where: { projectId },
    select: { id: true, name: true, slug: true },
  });

  const projectUrl = `http://localhost:3000/p/${project.id}`;

  return (
    <AIEditorPage
      projectId={projectId}
      pageId={pageId}
      initialElements={initialElements}
      initialTheme={initialTheme}
      pageName={page.name}
      pageSlug={page.slug}
      pages={pages}
      projectUrl={projectUrl}
    />
  );
}
