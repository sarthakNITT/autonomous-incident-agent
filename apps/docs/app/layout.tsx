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
            <div className="grid flex-1 items-start md:grid-cols-[260px_minmax(0,1fr)] lg:grid-cols-[260px_minmax(0,1fr)_220px]">
              <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block border-r">
                <DocsSidebar />
              </aside>
              <main className="relative py-6 lg:gap-10 lg:py-8 lg:px-8">
                <div className="mx-auto w-full min-w-0 max-w-[760px]">
                  {children}
                </div>
              </main>

              <div className="hidden text-sm lg:block">
                <DocsTOC />
              </div>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
