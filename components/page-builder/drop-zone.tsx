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
    e.dataTransfer.dropEffect = e.dataTransfer.types.includes("element-id") ? "move" : "copy";
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
        "min-h-[24px] transition-all duration-200 flex-shrink-0 relative",
        isOver && "min-h-[32px] bg-[#6366f1]/15 rounded border-2 border-dashed border-[#6366f1]",
        !isOver && "hover:bg-[#262626]/50",
        className
      )}
    >
      {isOver && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-xs font-medium text-[#6366f1]">Drop here</span>
        </div>
      )}
    </div>
  );
}
