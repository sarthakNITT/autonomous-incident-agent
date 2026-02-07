import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { DocsNavbar } from "@/components/docs-navbar";
import { DocsSidebar } from "@/components/docs-sidebar";
import { DocsTOC } from "@/components/docs-toc";
import { ThemeProvider } from "@/components/theme-provider";

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
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col bg-background">
            <DocsNavbar />
            <div className="grid flex-1 items-start md:grid-cols-[300px_minmax(0,1fr)] lg:grid-cols-[300px_minmax(0,1fr)_288px]">
              <aside className="fixed top-24 z-30 hidden h-[calc(100vh-9.25rem)] w-full shrink-0 md:sticky md:block bg-card/80 backdrop-blur-[2px]">
                <DocsSidebar />
              </aside>
              <main className="relative py-8 px-6 bg-card min-h-[calc(100vh-3.5rem)] shadow-surface">
                <div className="mx-auto w-full min-w-0 max-w-[740px]">
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
