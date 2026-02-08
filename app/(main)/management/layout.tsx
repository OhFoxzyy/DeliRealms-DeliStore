"use client";

import { DashboardHeader } from "@/components/dashboard/header";
import { ManagementSidebar } from "@/components/management/management-sidebar";
import { SessionProvider } from "next-auth/react";

export default function ManagementLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <DashboardHeader />
        <div className="flex flex-1">
          <ManagementSidebar />
          <main className="flex-1 overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </SessionProvider>
  );
}
