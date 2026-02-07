import React from "react";
import { cn } from "../lib/utils";

interface TOCProps {
  toc: { title: string; url: string; depth: number }[];
}

export function TOC({ toc }: TOCProps) {
  if (!toc || toc.length === 0) return null;

  return (
    <div className="hidden text-sm xl:block">
      <div className="sticky top-16 -mt-10 pt-4">
        <ScrollArea className="pb-10 h-[calc(100vh-3.5rem)]">
          <div className="space-y-2">
            <p className="font-medium">On This Page</p>
            <ul className="m-0 list-none">
              {toc.map((item, index) => (
                <li key={index} className="mt-0 pt-2">
                  <a
                    href={item.url}
                    className={cn(
                      "inline-block no-underline transition-colors hover:text-foreground",
                      item.depth === 3
                        ? "pl-4 text-muted-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {item.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

function ScrollArea({
  className,
  children,
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className="h-full w-full rounded-[inherit] overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
