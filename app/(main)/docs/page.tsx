import Link from "next/link";
import { PrismaClient } from "@/generated/prisma";
import { Box, Shield } from "lucide-react";

const prisma = new PrismaClient();

export default async function DocsPage() {
  const pages = await prisma.docPage.findMany({
    where: { published: true },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      title: true,
      slug: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return (
    <div className="min-h-screen bg-black text-foreground flex">
      <aside className="w-64 border-r border-border/50 p-6 overflow-y-auto">
        <div className="space-y-4 mb-8">
          <div className="p-3 border border-border/50 rounded-lg bg-card/30">
            <div className="flex items-center gap-2 mb-1">
              <Box className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Using App Router</span>
            </div>
            <p className="text-xs text-muted-foreground">Features available in /app</p>
          </div>
          <div className="p-3 border border-border/50 rounded-lg bg-card/30">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Latest Version</span>
            </div>
            <p className="text-xs text-muted-foreground">16.1.6</p>
          </div>
        </div>

        <nav className="space-y-1">
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Getting Started
          </div>
          {pages.map((page) => (
            <Link
              key={page.id}
              href={`/docs/${page.slug}`}
              className="block px-3 py-2 text-sm rounded-md hover:bg-card/50 transition-colors text-muted-foreground hover:text-foreground"
            >
              {page.title}
            </Link>
          ))}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-16">
          <div className="mb-12">
            <h1 className="text-5xl font-bold mb-4">Documentation</h1>
            <p className="text-xl text-muted-foreground">Welcome to the documentation!</p>
          </div>

          {pages.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p className="text-lg">No documentation pages yet.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold mb-4">What is this?</h2>
                <p className="text-lg text-muted-foreground mb-4">
                  This is the documentation for our platform. Learn how to use our features and build amazing things.
                </p>
              </div>

              <div>
                <h2 className="text-3xl font-bold mb-4">How to use the docs</h2>
                <p className="text-lg text-muted-foreground mb-4">
                  The docs are organized into sections:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>
                    <Link href="/docs" className="text-primary hover:underline">
                      Getting Started
                    </Link>
                    : Step-by-step tutorials to help you get started
                  </li>
                  <li>
                    <Link href="/docs" className="text-primary hover:underline">
                      Guides
                    </Link>
                    : Tutorials on specific use cases
                  </li>
                  <li>
                    <Link href="/docs" className="text-primary hover:underline">
                      API Reference
                    </Link>
                    : Detailed technical reference for every feature
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </main>

      <aside className="w-64 border-l border-border/50 p-6">
        <div className="sticky top-6">
          <h3 className="text-sm font-semibold mb-4">On this page</h3>
          <nav className="space-y-2">
            <a href="#what-is-this" className="block text-sm text-primary hover:underline">
              What is this?
            </a>
            <a href="#how-to-use" className="block text-sm text-muted-foreground hover:text-foreground">
              How to use the docs
            </a>
          </nav>
        </div>
      </aside>
    </div>
  );
}