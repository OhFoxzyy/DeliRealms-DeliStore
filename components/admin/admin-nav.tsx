"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Newspaper, 
  Map, 
  Users, 
  Settings,
  Home
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Documentation",
    href: "/admin/docs",
    icon: FileText,
  },
  {
    title: "Blog",
    href: "/admin/blog",
    icon: Newspaper,
  },
  {
    title: "Roadmap",
    href: "/admin/roadmap",
    icon: Map,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminNav() {
  const pathname = usePathname();

  return (
    <div className="w-64 border-r border-[#262626] bg-[#0f0f0f] flex flex-col">
      <div className="p-6 border-b border-[#262626]">
        <Link href="/dashboard" className="flex items-center gap-2 text-[#fafafa] hover:text-white transition-colors">
          <Home className="h-5 w-5" />
          <span className="font-semibold">Back to Dashboard</span>
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                isActive
                  ? "bg-[#262626] text-[#fafafa]"
                  : "text-[#a3a3a3] hover:bg-[#171717] hover:text-[#fafafa]"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="font-medium">{item.title}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
