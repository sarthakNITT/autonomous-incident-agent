"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { sidebarItems } from "@/lib/docs-config";

export function DocsTOC() {
  const pathname = usePathname();
  const [headings, setHeadings] = React.useState<
    { id: string; title: string; depth: number }[]
  >([]);
  const [activeId, setActiveId] = React.useState<string>("");

  const activeGroup = sidebarItems.find((group) =>
    group.items.some((item) => item.href === pathname),
  );

  React.useEffect(() => {
    const elements = Array.from(document.querySelectorAll("h2, h3")).map(
      (elem) => ({
        id: elem.id,
        title: elem.textContent?.replace("#", "") || "",
        depth: Number(elem.tagName.substring(1)),
      }),
    );
    setHeadings(elements);
    setActiveId("");

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
  }, [pathname]);

  const activeIndex = headings.findIndex((h) => h.id === activeId);
  let activeParentId = "";
  if (activeIndex !== -1 && headings[activeIndex].depth === 3) {
    for (let i = activeIndex - 1; i >= 0; i--) {
      if (headings[i].depth === 2) {
        activeParentId = headings[i].id;
        break;
      }
    }
  }

  if (!activeGroup) return null;

  return (
    <div className="space-y-2 px-10 pt-10 pb-10">
      <p className="font-medium text-sm text-foreground">On This Page</p>

      <div className="pt-4">
        <h4 className="mb-2 text-[13px] font-semibold text-foreground tracking-wide uppercase opacity-80">
          {activeGroup.title}
        </h4>
        <div className="flex flex-col space-y-2">
          {activeGroup.items.map((item) => {
            const isActivePage = pathname === item.href;
            return (
              <React.Fragment key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "text-[13px] transition-colors hover:text-foreground",
                    isActivePage
                      ? "font-medium text-foreground"
                      : "text-muted-foreground hover:text-foreground opacity-50",
                  )}
                >
                  {item.title}
                </Link>
                {isActivePage && headings.length > 0 && (
                  <div className="flex flex-col space-y-2 mt-2">
                    {headings.map((heading) => {
                      const isActive = heading.id === activeId;
                      const isParentActive = heading.id === activeParentId;
                      const showLine = isActive || isParentActive;

                      return (
                        <Link
                          key={heading.id}
                          href={`#${heading.id}`}
                          className={cn(
                            "relative block text-[12.5px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                            "text-muted-foreground hover:text-foreground line-clamp-1 duration-160 ease-out",
                            isActive
                              ? "opacity-100 font-medium text-foreground"
                              : "opacity-50",

                            heading.depth === 2 &&
                              "pl-4 border-l-2 border-transparent",
                            heading.depth === 2 &&
                              showLine &&
                              "border-foreground",

                            heading.depth === 3 && "pl-6",
                            heading.depth === 3 &&
                              isActive &&
                              "before:absolute before:left-2 before:top-1.5 before:h-1.5 before:w-1.5 before:rounded-full before:bg-foreground",
                          )}
                        >
                          {heading.title}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
