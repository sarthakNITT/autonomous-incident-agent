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
                <div className="mx-auto w-full min-w-0 max-w-3xl">
                  {children}
                </div>
              </main>
              <div className="hidden text-sm lg:block">
                {/* TOC is handled via context or per-page, but for layout parity we place a container here. 
                     However, TOC usually needs page content headings. 
                     We will let the page render the TOC portal or use the Right Column for it.
                     Actually, strict grid requires the column here.
                     We can put a sticky TOC placeholder or Render it from Page.
                     To keep it simple, we will port the TOC component but typically it requires data from the specific page.
                     We will leave this empty in layout and let Page inject it?
                     No, standard pattern is Page renders TOC in a dedicated slot or absolute/sticky column.
                     But our grid defines the column.
                     I will render a 'div' here and let pages use a Portal or just have the page component NOT Use this column? 
                     Wait, if I define grid in layout, I can't easily put page content in center and TOC in right unless I pass TOC as prop layout.
                     App Router Pages are children.
                     So children occupies the center AND right?
                     If I use `grid-cols-[260px_minmax(0,1fr)_220px]`, then `children` must span or be the grid container?
                     No, the layout defines the grid.
                     So `aside` is col 1.
                     `main` should be col 2?
                     And TOC col 3?
                     But `children` contains the main content.
                     The TOC data comes from the MDX source in the Page.
                     So the Page needs to return the TOC component?
                     If I put `children` in `main` (col 2), where does Col 3 come from?
                     If I make `main` span 2 cols, the page can render TOC?
                     Or I can make the layout simplistic: Sidebar + Children. Children (Page) defines the inner grid (Content + TOC).
                     Steps said: "Root layout must be: <div class="grid ...">".
                     If Root layout has the grid, then `children` must provide content for 2nd and 3rd columns?
                     That's not how `children` works (it's a single React node).
                     So I will make `main` span the remaining space, or I will put the grid IN the page?
                     But user said "Root layout must be...".
                     If I put `children` inside the centralized column, I can't put TOC in right column easily from Layout.
                     However, if I assume the Page renders specific layout...
                     Let's use a "Sidebar Layout" where `children` is everything right of sidebar.
                     `md:grid-cols-[260px_1fr]`.
                     Then the Page (`[...slug]/page.tsx`) implements the Content + TOC grid?
                     BUT user requirement: "Root layout must be: <div class="grid grid-cols-[260px_minmax(0,1fr)_220px]">".
                     This implies strict global layout.
                     If so, how to pass TOC data to Layout?
                     In App Router, we can't easily pass data up.
                     We can use a Server Component for TOC if we can determine slug in Layout (we can't easily).
                     OR, `children` is just the `main` content, and `TOC` is rendered by Layout? But Layout doesn't know content.
                     Maybe the user implies the visual result.
                     I will try to match the grid in `layout.tsx` but maybe make the right column a Slot or use a Context?
                     Actually, simplest is to let `children` be the content, and use a Client Component for TOC that reads DOM?
                     The `apps/docs/src/components/TOC.tsx` used `IntersectionObserver` on `h2, h3`. It didn't take `toc` prop strictly for the Spy, but it TOOK `toc` prop for the list.
                     If I can generate the list from DOM in Client Component, I don't need Props.
                     `apps/docs/src/components/TOC.tsx` currently takes `toc` array.
                     If I change it to `DocsTOC` that queries `document.querySelectorAll("h2, h3")` to GENERATE the links, I avoid data passing.
                     I will try that approach for the Migration to decouple Layout from Page Data.
                     So Layout renders Sidebar, Main (Children), and TOC (Client Component).
                     TOC Client Component will scan DOM for headings.
                 */}
                <aside className="fixed top-14 z-30 h-[calc(100vh-3.5rem)] w-full shrink-0 overflow-y-auto border-l py-6 pr-6 lg:py-8">
                  <DocsTOC />
                </aside>
              </div>
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
