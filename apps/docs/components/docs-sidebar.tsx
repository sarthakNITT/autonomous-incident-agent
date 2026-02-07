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
    <div
      className={cn("relative overflow-hidden py-6 pr-6 lg:py-8", className)}
    >
      <div className="h-full w-full bg-transparent">
        {sidebarItems.map((group, i) => (
          <div key={i} className="pb-4">
            <h4 className="mb-1 rounded-md px-2 py-1 text-xs font-semibold text-muted-foreground">
              {group.title}
            </h4>
            {group.items?.length && (
              <div className="grid grid-flow-row auto-rows-max text-[13px] gap-0.5">
                {group.items.map((item, j) => (
                  <Link
                    key={j}
                    href={item.href}
                    className={cn(
                      "group flex w-full items-center border border-transparent px-[10px] py-[6px] hover:underline text-muted-foreground hover:bg-muted/40 transition-colors duration-140 rounded-[6px]",
                      pathname === item.href
                        ? "font-medium text-foreground border-l-2 border-accent !border-t-transparent !border-r-transparent !border-b-transparent rounded-none -ml-[1px] pl-[9px]"
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
