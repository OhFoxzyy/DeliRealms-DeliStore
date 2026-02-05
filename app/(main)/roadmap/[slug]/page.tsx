import { notFound } from "next/navigation";
import { PrismaClient } from "@/generated/prisma";
import { MarkdownPreview } from "@/components/admin/markdown-preview";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

const prisma = new PrismaClient();

const statusConfig = {
  planned: { icon: Clock, color: "text-muted-foreground", label: "Planned" },
  in_progress: { icon: Clock, color: "text-orange-500", label: "In Progress" },
  completed: { icon: CheckCircle2, color: "text-green-500", label: "Completed" },
  cancelled: { icon: XCircle, color: "text-red-500", label: "Cancelled" },
};

export default async function RoadmapItemPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const item = await prisma.roadmapItem.findUnique({
    where: { slug },
  });

  if (!item) {
    notFound();
  }

  const StatusIcon = statusConfig[item.status].icon;
  const statusColor = statusConfig[item.status].color;
  const statusLabel = statusConfig[item.status].label;

  return (
    <div className="min-h-screen bg-black text-foreground">
      <div className="max-w-4xl mx-auto px-4 lg:px-6 py-16">
        <article>
          <header className="mb-8 pb-8 border-b border-border/50">
            <div className="flex items-center gap-3 mb-4">
              <StatusIcon className={`h-6 w-6 ${statusColor}`} />
              <span className="text-sm text-muted-foreground uppercase">{statusLabel}</span>
            </div>
            <h1 className="text-5xl font-bold mb-4">
              {item.title}
              {item.eta && (
                <span className="text-2xl font-normal text-muted-foreground ml-3">
                  - {item.eta}
                </span>
              )}
            </h1>
          </header>
          <div className="prose prose-invert prose-lg max-w-none">
            <MarkdownPreview content={item.description} />
          </div>
        </article>
      </div>
    </div>
  );
}
