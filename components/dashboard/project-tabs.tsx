"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";

interface ProjectTabsProps {
  projectId: string;
  projectName: string;
}

const projectNavItems = [
  { href: "", label: "Overview" },
  { href: "/pages", label: "Pages" },
  { href: "/env-vars", label: "Environment Variables" },
  { href: "/integrations", label: "Integrations" },
  { href: "/domains", label: "Domains" },
  { href: "/deployments", label: "Deployments" },
  { href: "/analytics", label: "Analytics" },
  { href: "/settings", label: "Settings" },
];

export function ProjectTabs({ projectId, projectName }: ProjectTabsProps) {
  const pathname = usePathname();
  const baseHref = `/dashboard/projects/${projectId}`;

  return (
    <div className="border-b bg-background/95 backdrop-blur">
      <div className="container px-4">
        <div className="flex items-center justify-between py-2">
          <h2 className="text-lg font-semibold">{projectName}</h2>
        </div>
        <nav className="flex gap-1 overflow-x-auto">
          {projectNavItems.map((item) => {
            const fullHref = baseHref + item.href;
            const isActive = pathname === fullHref;
            
            return (
              <Link key={fullHref} href={fullHref}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "text-sm font-medium transition-colors hover:text-foreground rounded-none border-b-2 border-transparent",
                    isActive
                      ? "text-foreground border-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
