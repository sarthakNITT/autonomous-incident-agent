export interface SidebarItem {
  title: string;
  href: string;
  showDot?: boolean;
}

export interface SidebarGroup {
  title: string;
  items: SidebarItem[];
}

export const sidebarItems: SidebarGroup[] = [
  {
    title: "Getting Started",
    items: [
      { title: "Introduction", href: "/docs/getting-started", showDot: true },
      { title: "Installation", href: "/docs/install" },
      { title: "GitHub Bot", href: "/docs/github-bot" },
      { title: "Running Agent", href: "/docs/running-agent" },
    ],
  },
  {
    title: "Architecture",
    items: [
      {
        title: "Overview",
        href: "/docs/architecture/overview",
        showDot: true,
      },
      { title: "Data Flow", href: "/docs/architecture/data-flow" },
      { title: "AI Engine", href: "/docs/architecture/ai-engine" },
      { title: "R2 Lifecycle", href: "/docs/architecture/r2-lifecycle" },
      {
        title: "Repro Pipeline",
        href: "/docs/architecture/repro-pipeline",
        showDot: true,
      },
      {
        title: "Git Integration",
        href: "/docs/architecture/git-integration",
      },
    ],
  },
  {
    title: "Tutorials",
    items: [
      { title: "Node.js", href: "/docs/tutorials/node" },
      { title: "Next.js", href: "/docs/tutorials/next" },
      { title: "Vercel", href: "/docs/tutorials/vercel" },
      { title: "Netlify", href: "/docs/tutorials/netlify" },
      { title: "Debugging", href: "/docs/tutorials/debug", showDot: true },
    ],
  },
  {
    title: "Reference",
    items: [
      { title: "Config", href: "/docs/reference/config" },
      { title: "Events", href: "/docs/reference/events" },
      { title: "R2 Layout", href: "/docs/reference/r2-layout" },
      { title: "State Schema", href: "/docs/reference/state", showDot: true },
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
