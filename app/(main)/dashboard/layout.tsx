"use client";

import { DashboardHeader } from "@/components/dashboard/header";
import { SessionProvider } from "next-auth/react";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <div className="min-h-screen flex flex-col">
        <DashboardHeader />
        <main className="flex-1 bg-background">
          <div className="max-w-6xl mx-auto w-full px-4 lg:px-6 py-6">
            {children}
          </div>
        </main>
      </div>
    </SessionProvider>
  );
};

export default Layout;
