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
              const contributors: Array<{ id: string; name: string | null; image: string | null }> = [];
              if (post.contributorIds) {
                try {
                  const ids = typeof post.contributorIds === 'string' ? JSON.parse(post.contributorIds) : post.contributorIds;
                  if (Array.isArray(ids)) {
                    contributors.push(...ids.map((id: string) => ({ id, name: null, image: null })));
                  }
                } catch (e) {
                  console.error('Failed to parse contributors', e);
                }
              }
              const allContributors = post.author ? [post.author, ...contributors] : contributors;
              const visibleContributors = allContributors.slice(0, 3);
              const hiddenCount = allContributors.length - 3;

              return (
                <div
                  key={post.id}
                  className="border border-border/50 rounded-lg p-6 bg-card/30 hover:bg-card/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-muted-foreground">
                      {new Date(post.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                    {allContributors.length > 0 && (
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <div className="flex items-center -space-x-2 cursor-pointer">
                            {visibleContributors.map((contributor, idx) => (
                              <Avatar key={idx} className="h-6 w-6 border-2 border-background">
                                <AvatarImage src={contributor.image || undefined} />
                                <AvatarFallback className="text-xs">
                                  {contributor.name?.charAt(0).toUpperCase() || "?"}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {hiddenCount > 0 && (
                              <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
                                +{hiddenCount}
                              </div>
                            )}
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-64">
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold">Contributors</h4>
                            <div className="space-y-1">
                              {allContributors.map((contributor, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm">
                                  <Avatar className="h-6 w-6">
                                    <AvatarImage src={contributor.image || undefined} />
                                    <AvatarFallback className="text-xs">
                                      {contributor.name?.charAt(0).toUpperCase() || "?"}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{contributor.name || "Unknown"}</span>
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
                    <div className="text-muted-foreground mb-4">
                      <MarkdownPreview content={post.description} />
                    </div>
                  )}

                  <Button asChild variant="ghost" className="mt-4">
                    <Link href={`/blog/${post.slug}`}>
                      Read More
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}