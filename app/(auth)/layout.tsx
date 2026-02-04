import React from "react";
import { LandingHeader } from "@/components/landing/header";
import { Footer } from "@/components/landing/footer";
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body>
        <LandingHeader />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
};

export default Layout;
