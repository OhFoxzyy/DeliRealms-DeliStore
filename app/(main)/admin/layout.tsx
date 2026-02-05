"use client";

import { DashboardHeader } from "@/components/dashboard/header";
import { SessionProvider } from "next-auth/react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <div className="min-h-screen flex flex-col bg-black">
        <DashboardHeader />
        <main className="flex-1 bg-black">
          <div className="max-w-6xl mx-auto w-full px-4 lg:px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </SessionProvider>
  );
}
