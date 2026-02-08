"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { sidebarItems } from "@/lib/docs-config";

interface DocsSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

function SidebarPageTOC() {
  const [headings, setHeadings] = React.useState<
    { id: string; title: string; depth: number }[]
  >([]);
  const [activeId, setActiveId] = React.useState<string>("");

  React.useEffect(() => {
    const elements = Array.from(document.querySelectorAll("h2, h3")).map(
      (elem) => ({
        id: elem.id,
        title: elem.textContent?.replace("#", "") || "",
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
    <div className="flex flex-col space-y-2 pl-4 pt-1">
      {headings.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className={cn(
            "text-[12px] transition-colors line-clamp-1 border-l pl-3 hover:text-foreground",
            item.id === activeId
              ? "text-foreground font-medium border-foreground opacity-100"
              : "text-muted-foreground border-transparent opacity-60 hover:opacity-100",
          )}
        >
          {item.title}
        </a>
      ))}
    </div>
  );
}

export function DocsSidebar({ className }: DocsSidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn("relative h-full pt-10 pb-6 px-10 lg:py-8", className)}>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-full w-[1px] bg-gradient-to-b from-transparent via-border/50 to-transparent" />
      <div
        className="h-full w-full bg-transparent overflow-y-auto pb-10 px-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent, black 40px, black 90%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, black 40px, black 90%, transparent)",
        }}
      >
        <div className="mx-auto w-full max-w-[220px]">
          {sidebarItems.map((group, i) => (
            <div key={i} className={cn("pb-8", i === 0 && "mt-8")}>
              <h4 className="mb-2 mt-2 px-2 text-[13px] font-semibold text-foreground tracking-wide uppercase opacity-80">
                {group.title}
              </h4>
              {group.items?.length && (
                <div className="grid grid-flow-row auto-rows-max text-[13px]">
                  {group.items.map((item, j) => (
                    <Link
                      key={j}
                      href={item.href}
                      className={cn(
                        "group flex w-fit items-center rounded-md border border-transparent px-3 py-1 text-muted-foreground transition-colors hover:text-foreground hover:bg-white/10",
                        pathname === item.href
                          ? "font-medium text-foreground bg-white/20 my-1"
                          : "hover:bg-white/13",
                      )}
                    >
                      {item.title}
                      {item.showDot && (
                        <div className="ml-2 h-1.5 w-1.5 rounded-full bg-blue-500 shadow-[0_0_4px_1px_rgba(59,130,246,0.5)]" />
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
