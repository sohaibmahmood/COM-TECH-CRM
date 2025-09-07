import type React from "react";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { DashboardSidebar } from "@/components/dashboard-sidebar";
import { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "@/components/session-provider";
import { NavigationProgress } from "@/components/navigation-progress";

const jakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta-sans",
  weight: ["200", "300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Comtech Academy CRM",
  description: "Student Management System for Comtech Academy",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${jakartaSans.variable} antialiased`}>
        <ThemeProvider defaultTheme="light" storageKey="comtech-ui-theme">
          <SessionProvider>
            <NavigationProgress />
            <Suspense fallback={<div>Loading...</div>}>
              <div className="flex h-screen bg-background transition-all duration-300 ease-in-out">
                <DashboardSidebar />
                <main className="flex-1 md:ml-64 overflow-auto transition-all duration-300 ease-in-out">
                  {children}
                </main>
              </div>
            </Suspense>
            <Toaster />
          </SessionProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
