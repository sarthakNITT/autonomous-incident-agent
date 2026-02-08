import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { DocsNavbar } from "@/components/docs-navbar";
import { DocsSidebar } from "@/components/docs-sidebar";
import { DocsTOC } from "@/components/docs-toc";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

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
        className={`${inter.variable} ${GeistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="relative flex min-h-screen flex-col bg-black">
            <DocsNavbar />
            <div className="grid flex-1 items-start md:grid-cols-[300px_minmax(0,1fr)] lg:grid-cols-[300px_minmax(0,1fr)_288px]">
              <aside className="fixed top-24 z-30 hidden h-[calc(100vh-9.25rem)] w-full shrink-0 md:sticky md:block bg-card/80 backdrop-blur-[2px]">
                <DocsSidebar />
              </aside>
              <main className="relative py-8 px-20 bg-card min-h-[calc(100vh-3.5rem)] shadow-surface">
                <div className="mx-auto w-full min-w-0 max-w-[740px]">
                  {children}
                </div>
              </main>

              <aside className="fixed top-24 z-30 hidden h-[calc(100vh-9.25rem)] w-full shrink-0 lg:sticky lg:block bg-card/80 backdrop-blur-[2px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                <DocsTOC />
              </aside>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
