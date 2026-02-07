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
    <div className={cn("pb-12", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Documentation
          </h2>
          <div className="space-y-1">
            {sidebarItems.map((group, i) => (
              <div key={i} className="py-2">
                <h4 className="mb-1 rounded-md px-2 py-1 text-sm font-semibold">
                  {group.title}
                </h4>
                {group.items?.length && (
                  <div className="grid grid-flow-row auto-rows-max text-sm">
                    {group.items.map((item, j) => (
                      <Link
                        key={j}
                        href={item.href}
                        className={cn(
                          "group flex w-full items-center rounded-md border border-transparent px-2 py-1 hover:underline",
                          pathname === item.href
                            ? "font-medium text-foreground"
                            : "text-muted-foreground",
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
      </div>
    </div>
  );
}
