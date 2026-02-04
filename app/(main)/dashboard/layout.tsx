import { DashboardHeader } from "@/components/dashboard/header";
import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body>
        <DashboardHeader/>
        <main>{children}</main>
      </body>
    </html>
  );
};

export default Layout;
