import { TOC } from "../components/TOC";
import { Navbar } from "../components/Navbar";
import { Sidebar } from "../components/Sidebar";
import { ChevronRight } from "lucide-react";

export function MainLayout({
  children,
  title = "Docs App",
  toc = [],
}: {
  children: React.ReactNode;
  title?: string;
  toc?: any[];
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{title} - AIA Docs</title>
        <link rel="stylesheet" href="/styles.css" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
          if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark')
          } else {
            document.documentElement.classList.remove('dark')
          }
        `,
          }}
        />
      </head>
      <body className="min-h-screen bg-background font-sans text-foreground">
        <div className="relative flex min-h-screen flex-col">
          <Navbar />
          <div className="flex-1">
            <div className="container flex-1 items-start md:grid md:grid-cols-[220px_minmax(0,1fr)] md:gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-10">
              <aside className="fixed top-14 z-30 -ml-2 hidden h-[calc(100vh-3.5rem)] w-full shrink-0 md:sticky md:block">
                <div className="h-full py-6 pr-6 lg:py-8">
                  <Sidebar />
                </div>
              </aside>
              <main className="relative py-6 lg:gap-10 lg:py-8 xl:grid xl:grid-cols-[1fr_300px]">
                <div className="mx-auto w-full min-w-0">
                  <div className="mb-4 flex items-center space-x-1 text-sm text-muted-foreground">
                    <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                      Docs
                    </div>
                    <ChevronRight className="h-4 w-4" />
                    <div className="font-medium text-foreground">{title}</div>
                  </div>
                  {children}
                </div>
                <div className="hidden text-sm xl:block">
                  <TOC toc={toc} />
                </div>
              </main>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
