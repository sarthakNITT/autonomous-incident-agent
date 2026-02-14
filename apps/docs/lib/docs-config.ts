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
      { title: "Configuration", href: "/docs/reference/config" },
      { title: "Running Agent", href: "/docs/running-agent" },
    ],
  },
  {
    title: "Architecture",
    items: [
      { title: "Overview", href: "/docs/architecture/overview" },
      { title: "Architecture", href: "/docs/architecture", showDot: true },
      { title: "Data Flow", href: "/docs/architecture/data-flow" },
      { title: "AI Engine", href: "/docs/architecture/ai-engine" },
      { title: "State Schema", href: "/docs/reference/state" },
    ],
  },
  {
    title: "Integration",
    items: [
      { title: "OpenTelemetry", href: "/docs/opentelemetry", showDot: true },
      { title: "GitHub", href: "/docs/github-bot" },
      { title: "Node.js Tutorial", href: "/docs/tutorials/node" },
      { title: "Next.js Tutorial", href: "/docs/tutorials/next" },
    ],
  },
  {
    title: "Operations",
    items: [{ title: "Troubleshooting", href: "/docs/troubleshooting" }],
  },
];
