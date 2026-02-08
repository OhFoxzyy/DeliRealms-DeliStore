import React from "react";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { Metadata } from "next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: 'DeliRealms - Advanced Platform Management',
    template: '%s | DeliRealms',
  },
  description: 'Enterprise-grade platform management with role-based access control, abuse detection, and comprehensive user management tools.',
  keywords: ['platform management', 'user management', 'admin dashboard', 'role-based access', 'security monitoring'],
  authors: [{ name: 'DeliRealms' }],
  creator: 'DeliRealms',
  publisher: 'DeliRealms',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://delirealms.com',
    title: 'DeliRealms - Advanced Platform Management',
    description: 'Enterprise-grade platform management with role-based access control, abuse detection, and comprehensive user management tools.',
    siteName: 'DeliRealms',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DeliRealms - Advanced Platform Management',
    description: 'Enterprise-grade platform management with role-based access control, abuse detection, and comprehensive user management tools.',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
    userScalable: true,
  },
}

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <main>{children}</main>
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
};

export default Layout;
