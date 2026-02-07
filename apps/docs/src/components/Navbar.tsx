import React, { useState, useEffect, useRef } from "react";
import { Search, Menu, Github, Twitter } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Sidebar } from "./Sidebar";
import { Input } from "./ui/input";
import { docsRoutes } from "../lib/routes";
import { cn } from "../lib/utils";

export function Navbar() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState<typeof docsRoutes>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length > 0) {
      const filtered = docsRoutes.filter((route) =>
        route.title.toLowerCase().includes(query.toLowerCase()),
      );
      setResults(filtered);
      setIsOpen(true);
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 hidden md:flex">
          <a href="/" className="mr-6 flex items-center space-x-2">
            <span className="hidden font-bold sm:inline-block">AIA Docs</span>
          </a>
        </div>
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
            <Sidebar className="mt-8" />
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div
            className="w-full flex-1 md:w-auto md:flex-none"
            ref={containerRef}
          >
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search documentation..."
                className="pl-8 md:w-[300px] lg:w-[400px]"
                value={query}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setQuery(e.target.value)
                }
                onFocus={() => query.length > 0 && setIsOpen(true)}
              />
              {isOpen && (
                <div className="absolute top-full mt-2 w-full rounded-md border bg-popover p-2 shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 text-popover-foreground z-50 max-h-[300px] overflow-y-auto">
                  {results.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No results found.
                    </div>
                  ) : (
                    <div className="grid gap-1">
                      {results.map((result) => (
                        <a
                          key={result.href}
                          href={result.href}
                          className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                          onClick={() => setIsOpen(false)}
                        >
                          <span className="flex-1 truncate">
                            {result.title}
                          </span>
                          <span className="ml-auto text-xs text-muted-foreground">
                            Doc
                          </span>
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <nav className="flex items-center">
            <a href="https://github.com" target="_blank" rel="noreferrer">
              <div className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted transition-colors">
                <Github className="h-4 w-4" />
                <span className="sr-only">GitHub</span>
              </div>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer">
              <div className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted transition-colors">
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Twitter</span>
              </div>
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
