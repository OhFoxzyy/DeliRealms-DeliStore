"use client";

import { DashboardHeader } from "@/components/dashboard/header";
import { SessionProvider } from "next-auth/react";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <div className="min-h-screen flex flex-col">
        <DashboardHeader />
        <main className="flex-1">{children}</main>
      </div>
    </SessionProvider>
  );
};

export default Layout;
