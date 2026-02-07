"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export function DocsTOC() {
  const [headings, setHeadings] = React.useState<
    { id: string; title: string; depth: number }[]
  >([]);
  const [activeId, setActiveId] = React.useState<string>("");

  React.useEffect(() => {
    const elements = Array.from(document.querySelectorAll("h2, h3, h4")).map(
      (elem) => ({
        id: elem.id,
        title: elem.textContent || "",
        depth: Number(elem.tagName.substring(1)),
      }),
    );
    setHeadings(elements);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0% 0% -80% 0%" },
    );

    elements.forEach((elem) => {
      const el = document.getElementById(elem.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  if (!headings.length) return null;

  return (
    <div className="space-y-2">
      <p className="font-medium text-sm">On This Page</p>
      <ul className="m-0 list-none">
        {headings.map((item, index) => (
          <li key={index} className="mt-0 pt-2">
            <a
              href={`#${item.id}`}
              className={cn(
                "inline-block no-underline transition-colors hover:text-foreground line-clamp-1 text-[13px]",
                item.id === activeId
                  ? "font-medium text-foreground border-l-2 border-primary pl-4 -ml-4"
                  : "text-muted-foreground",
                item.depth === 3 && "pl-4",
                item.depth === 4 && "pl-8",
                item.id !== activeId && item.depth === 2 && "pl-0",
              )}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
