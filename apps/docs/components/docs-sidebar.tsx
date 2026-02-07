"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

const sidebarItems = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/docs/getting-started" },
      { title: "Installation", href: "/docs/install" },
      { title: "GitHub Bot", href: "/docs/github-bot" },
      { title: "Running Agent", href: "/docs/running-agent" },
    ],
  },
  {
    title: "Architecture",
    items: [
      { title: "Overview", href: "/docs/architecture/overview" },
      { title: "Data Flow", href: "/docs/architecture/data-flow" },
      { title: "AI Engine", href: "/docs/architecture/ai-engine" },
      { title: "R2 Lifecycle", href: "/docs/architecture/r2-lifecycle" },
      { title: "Git Integration", href: "/docs/architecture/git-integration" },
      { title: "Repro Pipeline", href: "/docs/architecture/repro-pipeline" },
    ],
  },
  {
    title: "Tutorials",
    items: [
      { title: "Node.js", href: "/docs/tutorials/node" },
      { title: "Next.js", href: "/docs/tutorials/next" },
      { title: "Vercel", href: "/docs/tutorials/vercel" },
      { title: "Netlify", href: "/docs/tutorials/netlify" },
      { title: "Debugging", href: "/docs/tutorials/debug" },
    ],
  },
  {
    title: "Reference",
    items: [
      { title: "Config", href: "/docs/reference/config" },
      { title: "Events", href: "/docs/reference/events" },
      { title: "R2 Layout", href: "/docs/reference/r2-layout" },
      { title: "State Schema", href: "/docs/reference/state" },
      { title: "CLI", href: "/docs/reference/cli" },
    ],
  },
  {
    title: "Troubleshooting",
    items: [
      { title: "Common Issues", href: "/docs/troubleshooting" },
      { title: "OpenTelemetry", href: "/docs/opentelemetry" },
      { title: "R2 Setup", href: "/docs/r2-setup" },
    ],
  },
];

interface DocsSidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function DocsSidebar({ className }: DocsSidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn("relative h-full pt-10 pb-6 px-10 lg:py-8", className)}>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 h-full w-[1px] bg-gradient-to-b from-transparent via-border/50 to-transparent" />
      <div
        className="h-full w-full bg-transparent overflow-y-auto pb-10 pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent, black 20px, black 90%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, black 20px, black 90%, transparent)",
        }}
      >
        {sidebarItems.map((group, i) => (
          <div key={i} className="pb-4">
            <h4 className="mb-1 mt-2 rounded-md px-2 py-1 text-xs font-normal text-muted-foreground/50">
              {group.title}
            </h4>
            {group.items?.length && (
              <div className="grid grid-flow-row auto-rows-max text-[13px] gap-1">
                {group.items.map((item, j) => (
                  <Link
                    key={j}
                    href={item.href}
                    className={cn(
                      "group flex w-full items-center rounded-md border border-transparent px-2 py-0.5 hover:underline text-muted-foreground transition-colors",
                      pathname === item.href
                        ? "font-medium text-foreground bg-accent"
                        : "hover:text-foreground",
                    )}
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
