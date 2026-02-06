"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Palette,
  Type,
} from "lucide-react";

interface MarkdownToolbarProps {
  textareaId: string;
  onInsert: (text: string) => void;
}

export function MarkdownToolbar({ textareaId, onInsert }: MarkdownToolbarProps) {
  const insertMarkdown = (before: string, after: string = "") => {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    const replacement = before + selected + after;

    onInsert(replacement);
  };

  const insertHTML = (tag: string, props: Record<string, string> = {}) => {
    const textarea = document.getElementById(textareaId) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);

    const propsStr = Object.entries(props)
      .map(([k, v]) => `${k}="${v}"`)
      .join(" ");

    const replacement = `<${tag}${propsStr ? " " + propsStr : ""}>${selected || tag === "span" ? "text" : ""}</${tag}>`;

    onInsert(replacement);
  };

  const btnClass = "h-8 w-8 p-0 text-[#e5e5e5] hover:bg-[#262626] hover:text-[#fafafa]";

  return (
    <div className="flex flex-wrap items-center gap-1 p-2 bg-[#0f0f0f] border-b border-[#262626]">
      <Button type="button" variant="ghost" size="sm" className={btnClass} onClick={() => insertMarkdown("**", "**")} title="Bold (Ctrl+B)">
        <Bold className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" className={btnClass} onClick={() => insertMarkdown("*", "*")} title="Italic (Ctrl+I)">
        <Italic className="h-4 w-4" />
      </Button>
      <div className="h-4 w-px bg-[#262626] mx-1" />
      <Button type="button" variant="ghost" size="sm" className={btnClass} onClick={() => insertMarkdown("# ", "")} title="Heading 1">
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" className={btnClass} onClick={() => insertMarkdown("## ", "")} title="Heading 2">
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" className={btnClass} onClick={() => insertMarkdown("### ", "")} title="Heading 3">
        <Heading3 className="h-4 w-4" />
      </Button>
      <div className="h-4 w-px bg-[#262626] mx-1" />
      <Button type="button" variant="ghost" size="sm" className={btnClass} onClick={() => insertMarkdown("- ", "")} title="Bullet List">
        <List className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" className={btnClass} onClick={() => insertMarkdown("1. ", "")} title="Numbered List">
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" className={btnClass} onClick={() => insertMarkdown("[", "](url)")} title="Link">
        <Link className="h-4 w-4" />
      </Button>
      <Button type="button" variant="ghost" size="sm" className={btnClass} onClick={() => insertMarkdown("`", "`")} title="Code">
        <Code className="h-4 w-4" />
      </Button>
      <div className="h-4 w-px bg-[#262626] mx-1" />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="sm" className={btnClass} title="Text Color">
            <Palette className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#171717] border-[#262626]">
          {[
            { name: "red", value: "#ef4444" },
            { name: "blue", value: "#3b82f6" },
            { name: "green", value: "#10b981" },
            { name: "yellow", value: "#eab308" },
            { name: "purple", value: "#a855f7" },
            { name: "orange", value: "#f97316" },
            { name: "pink", value: "#ec4899" },
            { name: "cyan", value: "#06b6d4" },
          ].map((color) => (
            <DropdownMenuItem
              key={color.name}
              onClick={() => insertHTML("span", { style: `color: ${color.value}` })}
              className="text-[#e5e5e5] focus:bg-[#262626] focus:text-[#fafafa]"
            >
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color.value }} />
                <span className="capitalize">{color.name}</span>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button type="button" variant="ghost" size="sm" className={btnClass} title="Font Weight">
            <Type className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#171717] border-[#262626]">
          <DropdownMenuItem onClick={() => insertHTML("span", { style: "font-weight: 300" })} className="text-[#e5e5e5] focus:bg-[#262626] focus:text-[#fafafa]">
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => insertHTML("span", { style: "font-weight: 400" })} className="text-[#e5e5e5] focus:bg-[#262626] focus:text-[#fafafa]">
            Normal
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => insertHTML("span", { style: "font-weight: 500" })} className="text-[#e5e5e5] focus:bg-[#262626] focus:text-[#fafafa]">
            Medium
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => insertHTML("span", { style: "font-weight: 600" })} className="text-[#e5e5e5] focus:bg-[#262626] focus:text-[#fafafa]">
            Semibold
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => insertHTML("span", { style: "font-weight: 700" })} className="text-[#e5e5e5] focus:bg-[#262626] focus:text-[#fafafa]">
            Bold
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
