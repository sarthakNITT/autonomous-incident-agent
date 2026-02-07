"use client";

import { Menu, Search, Github, Twitter } from "lucide-react";
import * as React from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";
// Ensure components/ui/button etc exist. Copy command earlier should have done this.
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DocsSidebar } from "@/components/docs-sidebar";
import { ModeToggle } from "@/components/mode-toggle";
import { docsRoutes } from "@/lib/routes";

export function DocsNavbar() {
  const [open, setOpen] = React.useState(false);
  const [showSearch, setShowSearch] = React.useState(false);

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowSearch((open) => !open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">AIA Docs</span>
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <button
              onClick={() => setShowSearch(true)}
              className="inline-flex items-center whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input hover:bg-accent hover:text-accent-foreground px-4 py-2 relative h-8 w-full justify-start rounded-[0.5rem] bg-background text-sm font-normal text-muted-foreground shadow-none sm:pr-12 md:w-40 lg:w-64"
            >
              <span className="hidden lg:inline-flex">
                Search documentation...
              </span>
              <span className="inline-flex lg:hidden">Search...</span>
              <kbd className="pointer-events-none absolute right-[0.3rem] top-[0.3rem] hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </button>
            {showSearch && (
              <SearchDialog open={showSearch} onOpenChange={setShowSearch} />
            )}
          </div>
          <nav className="flex items-center gap-2">
            <Link href="https://github.com" target="_blank" rel="noreferrer">
              <div className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted transition-colors">
                <Github className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </div>
            </Link>
            <Link href="https://twitter.com" target="_blank" rel="noreferrer">
              <div className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted transition-colors">
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Twitter</span>
              </div>
            </Link>
            <ModeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 md:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="pr-0">
                <DocsSidebar className="mt-8" />
              </SheetContent>
            </Sheet>
          </nav>
        </div>
      </div>
    </header>
  );
}

function SearchDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [query, setQuery] = React.useState("");
  // We need docsRoutes from lib/routes. But those hrefs might be legacy ("/getting-started").
  // Our rewrites handle them, so linking to them is valid.
  const results = React.useMemo(() => {
    if (!query) return [];
    return docsRoutes.filter((route) =>
      route.title.toLowerCase().includes(query.toLowerCase()),
    );
  }, [query]);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center sm:items-center">
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg">
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <input
            className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {results.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">
              No results found.
            </p>
          )}
          {results.map((result) => (
            <Link
              key={result.href}
              href={result.href} // "/getting-started" etc. Next.js Link will handle rewrites client-side? No, rewrites are server-side.
              // But if we click Link to "/getting-started", Next router might try to find page at /getting-started.
              // If page doesn't exist, it might hard reload or 404 client side?
              // Actually, for client-side navigation to work with rewrites, we might need to link to the DESTINATION ("/docs/getting-started")?
              // Let's assume we should update routes.ts?
              // Or map them here.
              // The sidebar links point to /docs/...
              // The search results point to legacy routes.
              // I should probably map them to /docs/... here or update routes.ts.
              // Updating routes.ts is cleaner but users said "Copy without changes: ... sidebar navigation structure".
              // But I rewrote sidebar items in `docs-sidebar.tsx`.
              // `docsRoutes` is imported from `lib/routes.ts` which I COPIED.
              // So `lib/routes.ts` has legacy paths.
              // I will map `result.href` to `/docs` prefix if it doesn't have it, to be safe for client router.
              // Or rely on server rewrite if hard reload?
              // Client router usually respects rewrites defined in next.config.js?
              // "Rewrites are applied to client-side routing" -> Yes.
              // So `<Link href="/getting-started">` should work if rewrite is defined.
              onClick={() => onOpenChange(false)}
              className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
            >
              <span>{result.title}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
