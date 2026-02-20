import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="mb-4 inline-flex items-center rounded-full border border-border bg-muted px-4 py-1.5 text-sm text-muted-foreground">
        <span className="mr-2">🚀</span> v3.0 — Now with Foxit, Kilo, Cline &
        Miro
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-6">
        Autonomous Incident Agent
      </h1>
      <p className="text-xl text-muted-foreground mb-4 max-w-[640px]">
        AI-powered deployment monitoring for Vercel & GitHub Pages. Detect
        failures via webhook, analyze root causes with AI, and fix incidents
        with one click.
      </p>
      <p className="text-sm text-muted-foreground mb-10 max-w-[540px]">
        Integrates with <strong>Foxit</strong> (PDF reports),{" "}
        <strong>Kilo AI</strong> (VS Code), <strong>Cline</strong> (automated
        pipelines), <strong>Miro</strong> (visual boards), and{" "}
        <strong>Deepgram</strong> (voice control).
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <Link href="/docs/getting-started">
          <Button size="lg">Get Started →</Button>
        </Link>
        <Link href="/docs/webhooks">
          <Button variant="outline" size="lg">
            Setup Webhooks
          </Button>
        </Link>
        <Link
          href="https://github.com/sarthakNITT/autonomous-incident-agent"
          target="_blank"
        >
          <Button variant="ghost" size="lg">
            GitHub
          </Button>
        </Link>
      </div>

      <div className="mt-16 grid grid-cols-2 md:grid-cols-3 gap-4 max-w-[700px] w-full text-left">
        {[
          { emoji: "🔗", title: "Webhook Monitoring", href: "/docs/webhooks" },
          {
            emoji: "🧠",
            title: "AI Root Cause Analysis",
            href: "/docs/architecture/ai-engine",
          },
          {
            emoji: "🦊",
            title: "Foxit PDF Reports",
            href: "/docs/integrations/foxit",
          },
          {
            emoji: "⚡",
            title: "Fix with Kilo AI",
            href: "/docs/integrations/kilo",
          },
          {
            emoji: "🖥",
            title: "Cline Pipeline",
            href: "/docs/integrations/cline",
          },
          {
            emoji: "📋",
            title: "Miro Boards",
            href: "/docs/integrations/miro",
          },
          { emoji: "🎤", title: "Voice Control", href: "/docs/features/voice" },
          {
            emoji: "💬",
            title: "AI Chat Assistant",
            href: "/docs/features/chat",
          },
          {
            emoji: "📊",
            title: "Incident Timeline",
            href: "/docs/features/timeline",
          },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 text-sm font-medium hover:bg-muted transition-colors"
          >
            <span>{item.emoji}</span>
            <span>{item.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
