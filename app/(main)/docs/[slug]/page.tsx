import { notFound } from "next/navigation";
import { PrismaClient } from "@/generated/prisma";
import { MarkdownPreview } from "@/components/admin/markdown-preview";
import { Box, Shield, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

const prisma = new PrismaClient();

export default async function DocPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const page = await prisma.docPage.findUnique({
    where: { slug },
  });

  const allPages = await prisma.docPage.findMany({
    where: { published: true },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      title: true,
      slug: true,
    },
  });

  if (!page || !page.published) {
    notFound();
  }

  const currentIndex = allPages.findIndex((p) => p.slug === slug);
  const prevPage = currentIndex > 0 ? allPages[currentIndex - 1] : null;
  const nextPage = currentIndex < allPages.length - 1 ? allPages[currentIndex + 1] : null;

  const headings = extractHeadings(page.content);

  return (
    <div className="min-h-screen bg-black text-foreground flex">
      <aside className="w-64 border-r border-zinc-800 p-6 overflow-y-auto">
        <div className="space-y-4 mb-8">
          <div className="p-3 border border-zinc-800 rounded-lg bg-zinc-900/50">
            <div className="flex items-center gap-2 mb-1">
              <Box className="h-4 w-4 text-zinc-500" />
              <span className="text-sm font-medium text-zinc-300">Using App Router</span>
            </div>
            <p className="text-xs text-zinc-500">Features available in /app</p>
          </div>
          <div className="p-3 border border-zinc-800 rounded-lg bg-zinc-900/50">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-zinc-500" />
              <span className="text-sm font-medium text-zinc-300">Latest Version</span>
            </div>
            <p className="text-xs text-zinc-500">16.1.6</p>
          </div>
        </div>

        <nav className="space-y-1">
          <div className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
            Getting Started
          </div>
          {allPages.map((p) => (
            <Link
              key={p.id}
              href={`/docs/${p.slug}`}
              className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                p.slug === slug
                  ? "bg-primary/20 text-primary font-medium"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100"
              }`}
            >
              {p.title}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-16">
          <article>
            <header className="mb-8 pb-8 border-b border-zinc-800">
              <div className="flex items-center gap-2 mb-4">
                <ChevronLeft className="h-5 w-5 text-zinc-500" />
                <h1 className="text-5xl font-bold text-zinc-100">{page.title}</h1>
                <ChevronRight className="h-5 w-5 text-zinc-500" />
              </div>
              <p className="text-xl text-zinc-500">
                Welcome to the Next.js documentation!
              </p>
            </header>
            <div className="prose prose-invert prose-lg max-w-none text-zinc-300">
              <MarkdownPreview content={page.content} />
            </div>

            {(prevPage || nextPage) && (
              <div className="mt-16 pt-8 border-t border-zinc-800 flex items-center justify-between">
                {prevPage && (
                  <Link
                    href={`/docs/${prevPage.slug}`}
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <div>
                      <div className="text-sm text-muted-foreground">Previous</div>
                      <div className="font-medium">{prevPage.title}</div>
                    </div>
                  </Link>
                )}
                {nextPage && (
                  <Link
                    href={`/docs/${nextPage.slug}`}
                    className="flex items-center gap-2 text-primary hover:underline ml-auto"
                  >
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">Next</div>
                      <div className="font-medium">{nextPage.title}</div>
                    </div>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            )}
          </article>
        </div>
      </main>

      <aside className="w-64 border-l border-zinc-800 p-6">
        <div className="sticky top-6">
          <h3 className="text-sm font-semibold mb-4 text-zinc-400">On this page</h3>
          <nav className="space-y-2">
            {headings.map((heading, idx) => (
              <a
                key={idx}
                href={`#${heading.id}`}
                className="block text-sm text-zinc-500 hover:text-zinc-100 hover:underline"
                style={{ paddingLeft: `${(heading.level - 1) * 12}px` }}
              >
                {heading.text}
              </a>
            ))}
          </nav>
          <a
            href="#"
            className="block text-xs text-zinc-500 hover:text-zinc-100 mt-8 pt-8 border-t border-zinc-800"
          >
            Edit this page on GitHub
          </a>
        </div>
      </aside>
    </div>
  );
}

function extractHeadings(content: string): Array<{ id: string; text: string; level: number }> {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  const headings: Array<{ id: string; text: string; level: number }> = [];
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2];
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    headings.push({ id, text, level });
  }

  return headings;
}