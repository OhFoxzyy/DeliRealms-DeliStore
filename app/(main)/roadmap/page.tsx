import Link from "next/link";
import { PrismaClient } from "@/generated/prisma";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Clock, XCircle, ArrowRight } from "lucide-react";
import { MarkdownPreview } from "@/components/admin/markdown-preview";

const prisma = new PrismaClient();

const statusConfig = {
  planned: { icon: Clock, color: "text-muted-foreground" },
  in_progress: { icon: Clock, color: "text-orange-500" },
  completed: { icon: CheckCircle2, color: "text-green-500" },
  cancelled: { icon: XCircle, color: "text-red-500" },
};

export default async function RoadmapPage() {
  const items = await prisma.roadmapItem.findMany({
    orderBy: [{ order: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="min-h-screen bg-black text-foreground">
      <div className="max-w-6xl mx-auto px-4 lg:px-6 py-16">
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">Roadmap</h1>
          <p className="text-xl text-muted-foreground">What we're working on</p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-lg">No roadmap items yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const StatusIcon = statusConfig[item.status].icon;
              const statusColor = statusConfig[item.status].color;
              const shortDescription = item.description.length > 150 
                ? item.description.substring(0, 150) + "..."
                : item.description;

              return (
                <div
                  key={item.id}
                  className="border border-border/50 rounded-lg p-6 bg-card/30 hover:bg-card/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-2xl font-bold">
                          {item.title}
                          {item.eta && (
                            <span className="text-lg font-normal text-muted-foreground ml-2">
                              - {item.eta}
                            </span>
                          )}
                        </h2>
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <StatusIcon className={`h-5 w-5 ${statusColor}`} />
                        <div className="text-sm text-muted-foreground prose prose-invert prose-sm max-w-none">
                          <MarkdownPreview content={shortDescription} />
                        </div>
                      </div>
                    </div>
                  </div>
                  {item.slug && (
                    <Button asChild variant="ghost" className="mt-4">
                      <Link href={`/roadmap/${item.slug}`}>
                        Read More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}