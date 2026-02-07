import React from "react";
import { Home, BookOpen, Layers } from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "../lib/utils";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  return (
    <div
      className={cn(
        "hidden border-r bg-muted/40 lg:block lg:w-64 lg:h-screen lg:sticky lg:top-0",
        className,
      )}
    >
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <a href="/" className="flex items-center gap-2 font-semibold">
            <span className="">Docs App</span>
          </a>
        </div>
        <div className="flex-1">
          <ScrollArea className="h-full px-2 py-2">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <a
                href="/"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Home className="h-4 w-4" />
                Home
              </a>
              <a
                href="/getting-started"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <BookOpen className="h-4 w-4" />
                Getting Started
              </a>
              <a
                href="/architecture"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Layers className="h-4 w-4" />
                Architecture
              </a>
            </nav>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
