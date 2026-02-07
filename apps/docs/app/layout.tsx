import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DocsNavbar } from "@/components/docs-navbar";
import { DocsSidebar } from "@/components/docs-sidebar";
import { DocsTOC } from "@/components/docs-toc";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AIA Docs",
  description: "Documentation for Autonomous Incident Agent",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col bg-background">
            <DocsNavbar />
            <div className="grid flex-1 items-start md:grid-cols-[240px_minmax(0,1fr)] lg:grid-cols-[240px_minmax(0,1fr)_240px] gap-6">
              <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block border-r border-border/40 bg-card/80 backdrop-blur-[2px]">
                <DocsSidebar />
              </aside>
              <main className="relative py-8 px-6 bg-card min-h-[calc(100vh-3.5rem)] shadow-surface">
                <div className="mx-auto w-full min-w-0 max-w-[760px]">
                  {children}
                </div>
              </main>

              <div className="hidden text-sm lg:block bg-card/80 backdrop-blur-[2px]">
                <DocsTOC />
              </div>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
