import Link from "next/link";
import { PrismaClient } from "@/generated/prisma";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MarkdownPreview } from "@/components/admin/markdown-preview";
import { ArrowRight } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";

const prisma = new PrismaClient();

type Contributor = { id: string; name: string | null; image: string | null };

export default async function BlogPage() {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { createdAt: "desc" },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  const contributorIds = new Set<string>();
  for (const post of posts) {
    if (post.contributorIds) {
      try {
        const ids = typeof post.contributorIds === "string"
          ? JSON.parse(post.contributorIds)
          : post.contributorIds;
        if (Array.isArray(ids)) ids.forEach((id: string) => contributorIds.add(id));
      } catch {
        // ignore
      }
    }
  }
  const contributorUsers =
    contributorIds.size > 0
      ? await prisma.user.findMany({
          where: { id: { in: [...contributorIds] } },
          select: { id: true, name: true, image: true },
        })
      : [];
  const contributorMap = new Map(contributorUsers.map((u) => [u.id, u]));

  return (
    <div className="min-h-screen bg-black text-foreground">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-16">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">Blog</h1>
          <p className="text-xl text-muted-foreground">Latest updates and insights</p>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">No blog posts yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => {
              const contributors: Contributor[] = [];
              if (post.contributorIds) {
                try {
                  const ids = typeof post.contributorIds === "string"
                    ? JSON.parse(post.contributorIds)
                    : post.contributorIds;
                  if (Array.isArray(ids)) {
                    for (const id of ids) {
                      const u = contributorMap.get(id);
                      contributors.push(
                        u ? { id: u.id, name: u.name, image: u.image } : { id, name: null, image: null }
                      );
                    }
                  }
                } catch {
                  // ignore
                }
              }
              const allContributors: Contributor[] = post.author
                ? [{ id: post.author.id, name: post.author.name, image: post.author.image }, ...contributors]
                : contributors;
              const visibleContributors = allContributors.slice(0, 3);
              const hiddenCount = allContributors.length - 3;

              return (
                <article
                  key={post.id}
                  className="border border-zinc-800 rounded-lg p-6 bg-black hover:bg-zinc-900/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-zinc-500">
                      {new Date(post.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    {allContributors.length > 0 && (
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <div className="flex items-center -space-x-2 cursor-pointer" aria-label="Contributors">
                            {visibleContributors.map((c, idx) => (
                              <Avatar key={c.id} className="h-6 w-6 border-2 border-black">
                                <AvatarImage src={c.image || undefined} />
                                <AvatarFallback className="text-xs bg-zinc-700 text-zinc-200">
                                  {c.name?.charAt(0).toUpperCase() || "?"}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {hiddenCount > 0 && (
                              <div className="h-6 w-6 rounded-full bg-zinc-700 border-2 border-black flex items-center justify-center text-xs text-zinc-200">
                                +{hiddenCount}
                              </div>
                            )}
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-64 bg-zinc-900 border-zinc-700">
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-zinc-100">Contributors</h4>
                            <div className="space-y-1">
                              {allContributors.map((c) => (
                                <div key={c.id} className="flex items-center gap-2 text-sm text-zinc-300">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={c.image || undefined} />
                                    <AvatarFallback className="text-xs bg-zinc-700 text-zinc-200">
                                      {c.name?.charAt(0).toUpperCase() || "?"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{c.name || "Unknown"}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    )}
                  </div>

                  <h2 className="text-2xl font-bold mb-3 text-foreground">
                    {post.title}
                  </h2>

                  {post.description && (
                    <div className="text-zinc-400 mb-4 prose prose-invert prose-sm max-w-none">
                      <MarkdownPreview content={post.description} />
                    </div>
                  )}

                  <Button asChild variant="ghost" className="mt-4 text-zinc-300 hover:text-zinc-100">
                    <Link href={`/blog/${post.slug}`}>
                      Read More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}