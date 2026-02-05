import { notFound } from "next/navigation";
import { PrismaClient } from "@/generated/prisma";
import { MarkdownPreview } from "@/components/admin/markdown-preview";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

const prisma = new PrismaClient();

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
          role: true,
        },
      },
    },
  });

  if (!post || !post.published) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black text-foreground">
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-16">
        <article>
          <header className="mb-8 pb-8 border-b border-border/50">
            <div className="mb-4 text-sm text-muted-foreground">
              {new Date(post.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <h1 className="text-5xl font-bold mb-6">{post.title}</h1>
            {post.author && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground">POSTED BY</span>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={post.author.image || undefined} />
                    <AvatarFallback>
                      {post.author.name?.charAt(0).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{post.author.name || "Unknown"}</span>
                  <Badge variant="secondary" className="text-xs">
                    {post.author.role}
                  </Badge>
                </div>
              </div>
            )}
          </header>
          <div className="prose prose-invert prose-lg max-w-none">
            <MarkdownPreview content={post.content} />
          </div>
        </article>
      </div>
    </div>
  );
}