"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { 
  Search, 
  Bell, 
  Settings, 
  LogOut, 
  User, 
  ChevronDown,
  MessageSquare,
  HelpCircle,
  CreditCard
} from "lucide-react";
import { cn } from "@/lib/utils";
import Logo from "../logo";

const getMainNavItems = (isAdmin: boolean, pathname: string | null) => {
  const onAdmin = pathname?.startsWith("/admin");
  if (isAdmin && onAdmin) {
    return [
      { href: "/dashboard", label: "Dashboard", exact: false },
      { href: "/admin", label: "Content", exact: true },
    ];
  }
  const items = [
    { href: "/dashboard", label: "Overview", exact: true },
    { href: "/dashboard/integrations", label: "Integrations" },
    { href: "/dashboard/activity", label: "Activity" },
    { href: "/dashboard/domains", label: "Domains" },
    { href: "/dashboard/usage", label: "Usage" },
    { href: "/dashboard/billing", label: "Billing" },
    { href: "/dashboard/settings", label: "Settings" },
  ];
  if (isAdmin) {
    items.push({ href: "/admin", label: "Admin", exact: false });
  }
  return items;
};

export function DashboardHeader() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [searchFocused, setSearchFocused] = useState(false);
  const isAdmin = session?.user?.role === "admin";
  const mainNavItems = getMainNavItems(isAdmin, pathname);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      {/* Top bar with logo and user */}
      <div className="flex h-16 items-center justify-between">
        <div className="flex items-center justify-between w-full max-w-6xl mx-auto px-4 lg:px-6">
          <div className="flex items-center gap-3">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center">
            <Logo/>
          </Link>
          
          <span className="text-muted-foreground">/</span>
          
          {/* Team/User selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2 h-8">
                <Avatar className="h-5 w-5">
                  <AvatarImage src={session?.user?.image || undefined} />
                  <AvatarFallback className="text-xs">
                    {session?.user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm">
                  {session?.user?.name || "Unknown"}
                </span>
                <Badge variant="ghost" className="text-xs px-1.5 py-0 h-5">
                  {session?.user?.role}
                </Badge>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Personal Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Account Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/billing">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Billing
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-blue-500" asChild>
                <Link href="/dashboard/billing/upgrade">Upgrade Plan</Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div
              className={cn(
                'relative hidden md:flex items-center transition-all',
                searchFocused ? 'w-64' : 'w-48',
              )}
            >
              <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="pl-9 h-8 bg-muted/50 border-transparent focus:border-border"
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
              />
              <kbd className="absolute right-2 pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                /
              </kbd>
            </div>

            {/* Feedback */}
            <Button
              variant="outline"
              size="sm"
              className="hidden lg:flex h-8 gap-1.5"
              asChild
            >
              <a href="mailto:support@vixle.app?subject=Feedback">
                <MessageSquare className="h-3.5 w-3.5" />
                Feedback
              </a>
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative h-8 w-8">
              <Bell className="h-4 w-4" />
            </Button>

            {/* Help */}
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <HelpCircle className="h-4 w-4" />
            </Button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-7 w-7">
                    <AvatarImage
                      src={session?.user?.image || undefined}
                      alt={session?.user?.name || 'User'}
                    />
                    <AvatarFallback className="text-xs">
                      {session?.user?.name?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {session?.user?.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {session?.user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="text-red-500 focus:text-red-500"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Secondary Navigation */}
      <div className="border-t border-border bg-background/90">
        <div className="flex items-center overflow-x-auto max-w-6xl mx-auto px-4 lg:px-6">
          <nav className="flex items-center gap-1">
          {mainNavItems.map((item) => {
            const isActive = item.exact 
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href + "/");
            
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "text-sm h-10 px-3 rounded-none border-b-2 transition-colors",
                    isActive
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground"
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
    </header>
  );
}
