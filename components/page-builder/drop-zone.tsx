"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface DropZoneProps {
  onDrop: (e: React.DragEvent) => void;
  parentId: string | null;
  index: number;
  className?: string;
}

export function DropZone({ onDrop, parentId, index, className }: DropZoneProps) {
  const [isOver, setIsOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
    setIsOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOver(false);
    onDrop(e);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      data-drop-parent={parentId}
      data-drop-index={index}
      className={cn(
<<<<<<< HEAD
        "min-h-[40px] transition-all flex-shrink-0 relative",
        isOver 
          ? "bg-accent/20 border-2 border-dashed border-accent rounded-lg" 
          : "border-2 border-dashed border-transparent hover:border-border/40 rounded-lg",
=======
        "min-h-[24px] transition-all duration-200 flex-shrink-0 relative",
        isOver && "bg-primary/20 rounded border-2 border-dashed border-primary/50",
        !isOver && "hover:bg-accent/5",
>>>>>>> c9965df20fa6fc21eb504d0fc60fd71845236cf7
        className
      )}
    >
      {isOver && (
        <div className="absolute inset-0 flex items-center justify-center">
<<<<<<< HEAD
          <span className="text-xs font-medium text-foreground/70">Drop here</span>
=======
          <div className="text-xs font-medium text-primary">Drop here</div>
>>>>>>> c9965df20fa6fc21eb504d0fc60fd71845236cf7
        </div>
      )}
    </div>
  );
}
