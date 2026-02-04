"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";
import { Button } from "../ui/button";
import type { Session } from "next-auth";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";
import Logo from "../logo";
import { Skeleton } from "../ui/skeleton";
import { ChevronsUpDown } from "lucide-react";

const navTabs = [
  {
    href: "/projects",
    label: "Projects",
    description: "View and manage all your projects",
  },
  {
    href: "/analytics",
    label: "Analytics",
    description: "Track your performance metrics",
  },
  {
    href: "/settings",
    label: "Settings",
    description: "Configure your account preferences",
  },
];

interface DashboardHeaderProps {
  session: Session | null;
  isLoading?: boolean;
  breadcrumbItems?: Array<{
    label: string;
    href?: string;
    icon?: React.ReactNode;
  }>;
}

export function DashboardHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleNavClick = (href: string) => {
    router.push(`dashboard/${href}`);
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
      <nav className="container mx-auto px-4 py-4 flex flex-col items-center justify-center gap-4">
        {/* Breadcrumb Navigation */}

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Logo />
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <div className="flex items-center gap-4 p-2 bg-accent/30 border-accent/30 border rounded-md">
                <Skeleton className="h-9 w-9 rounded-full" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-30" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Desktop Nav */}
        <div className="flex items-center gap-5">
          {navTabs.map((link) => {
            const isActive = pathname === link.href;

            return (
              <HoverCard openDelay={100} closeDelay={100} key={link.href}>
                <HoverCardTrigger asChild>
                  <Button
                    variant="link"
                    onClick={() => handleNavClick(link.href)}
                    className={`cursor-pointer font-normal text-sm transition-all duration-200 hover:text-foreground hover:bg-accent/50 px-4 py-2 rounded-md ${
                      isActive
                        ? "text-foreground bg-accent/30"
                        : "text-muted-foreground"
                    }`}
                  >
                    {link.label}
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="w-64 p-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold">{link.label}</h4>
                    <p className="text-sm text-muted-foreground">
                      {link.description}
                    </p>
                    <div className="text-xs text-muted-foreground/70 mt-2 font-mono">
                      {link.href}
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
