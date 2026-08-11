import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { createClient } from "@/utils/supabase/server";
import { TooltipProvider } from "@/components/ui/tooltip";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Infentra Workspace",
  description: "Management Dashboard for INFENTRA 2.0",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            {user ? (
              <SidebarProvider>
                <AppSidebar />
                <div className="flex flex-col w-full min-h-screen">
                  <AppHeader />
                  <main className="flex-1 overflow-auto bg-muted/20 p-4">
                    {children}
                  </main>
                </div>
              </SidebarProvider>
            ) : (
              children
            )}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
