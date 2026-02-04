"use client";

import { DashboardHeader } from "@/components/dashboard/header";
import { SessionProvider } from "next-auth/react";
import { usePathname } from "next/navigation";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  const isPageEditor = pathname?.match(/\/dashboard\/projects\/[^/]+\/pages\/[^/]+\/edit/);

  return (
    <SessionProvider>
      <div className="min-h-screen flex flex-col">
        {!isPageEditor && <DashboardHeader />}
        <main className="flex-1 bg-black">
          <div className={isPageEditor ? "contents" : "max-w-6xl mx-auto w-full px-4 lg:px-6 py-6"}>
            {children}
          </div>
        </main>
      </div>
    </SessionProvider>
  );
};

export default Layout;
