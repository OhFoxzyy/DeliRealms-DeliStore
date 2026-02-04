import { redirect, notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth';
import { PrismaClient } from '@/generated/prisma';
import { PageBuilder } from '@/components/page-builder/page-builder';

const prisma = new PrismaClient();

export default async function PageEditorPage({
  params,
}: {
  params: Promise<{ projectId: string; pageId: string }>;
}) {
  const { projectId, pageId } = await params;

  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/signin');
  }

  const page = await prisma.page.findUnique({
    where: { id: pageId },
    include: {
      project: {
        include: { pages: { orderBy: { createdAt: 'asc' } } },
      },
    },
  });

  if (!page || page.project.userId !== session.user.id) {
    notFound();
  }

  let initialElements = [];
  try {
    const content = JSON.parse(page.content);
    initialElements = content.elements || [];
  } catch (e) {
    console.error('Failed to parse page content:', e);
  }

  const pages = page.project.pages.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    isHome: p.isHome,
  }));

  const projectUrl = page.project.customDomain
    ? `https://${page.project.customDomain}/${page.slug === 'index' ? '' : page.slug}`
    : page.project.subdomain
    ? `https://${page.project.subdomain}.vixle.app/${page.slug === 'index' ? '' : page.slug}`
    : null;

  return (
    <PageBuilder
      projectId={projectId}
      pageId={pageId}
      initialElements={initialElements}
      pageName={page.name}
      pageSlug={page.slug}
      pages={pages}
      projectUrl={projectUrl}
    />
  );
}
