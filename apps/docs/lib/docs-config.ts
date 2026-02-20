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
    title: "Monitoring",
    items: [
      { title: "Webhook Setup", href: "/docs/webhooks", showDot: true },
      { title: "Incident Timeline", href: "/docs/features/timeline" },
      { title: "OpenTelemetry", href: "/docs/opentelemetry" },
    ],
  },
  {
    title: "Dashboard Features",
    items: [
      {
        title: "AI Chat Assistant",
        href: "/docs/features/chat",
        showDot: true,
      },
      { title: "Voice Control", href: "/docs/features/voice" },
    ],
  },
  {
    title: "Integrations",
    items: [
      {
        title: "Foxit PDF Reports",
        href: "/docs/integrations/foxit",
        showDot: true,
      },
      { title: "Kilo AI (VS Code)", href: "/docs/integrations/kilo" },
      { title: "Cline Pipeline", href: "/docs/integrations/cline" },
      { title: "Miro Boards", href: "/docs/integrations/miro" },
      { title: "GitHub", href: "/docs/github-bot" },
    ],
  },
  {
    title: "Tutorials",
    items: [
      { title: "Node.js Tutorial", href: "/docs/tutorials/node" },
      { title: "Next.js Tutorial", href: "/docs/tutorials/next" },
    ],
  },
  {
    title: "Operations",
    items: [{ title: "Troubleshooting", href: "/docs/troubleshooting" }],
  },
];
