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
          <h1 className="text-5xl font-bold mb-4 text-zinc-100">Roadmap</h1>
          <p className="text-xl text-zinc-500">What we're working on</p>
        </div>

        {items.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
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
                <article
                  key={item.id}
                  className="border border-zinc-800 rounded-lg p-6 bg-black hover:bg-zinc-900/50 transition-colors"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <StatusIcon className={`h-5 w-5 shrink-0 mt-0.5 ${statusColor}`} />
                    <div className="flex-1 min-w-0">
                      <h2 className="text-2xl font-bold text-zinc-100">
                        {item.title}
                        {item.eta && (
                          <span className="text-lg font-normal text-zinc-500 ml-2">- {item.eta}</span>
                        )}
                      </h2>
                      <div className="text-sm text-zinc-400 prose prose-invert prose-sm max-w-none mt-2">
                        <MarkdownPreview content={shortDescription} />
                      </div>
                    </div>
                  </div>
                  {item.slug && (
                    <Button asChild variant="ghost" className="mt-4 text-zinc-400 hover:text-zinc-100">
                      <Link href={`/roadmap/${item.slug}`}>
                        Read More
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}