import React from "react";
import {
  Home,
  BookOpen,
  Layers,
  Activity,
  Brain,
  Database,
  GitBranch,
  TestTube,
  Settings,
  TableProperties,
  Terminal,
  Server,
  AppWindow,
  Triangle,
  Hexagon,
  Bug,
} from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "../lib/utils";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  return (
    <div
      className={cn(
        "hidden border-r bg-muted/40 lg:block lg:w-64 lg:h-screen lg:sticky lg:top-0",
        className,
      )}
    >
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <a href="/" className="flex items-center gap-2 font-semibold">
            <span className="">Docs App</span>
          </a>
        </div>
        <div className="flex-1">
          <ScrollArea className="h-full px-2 py-2">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              <a
                href="/"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Home className="h-4 w-4" />
                Home
              </a>
              <a
                href="/getting-started"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <BookOpen className="h-4 w-4" />
                Getting Started
              </a>
              <h4 className="mb-1 mt-4 rounded-md px-2 py-1 text-sm font-semibold">
                Architecture
              </h4>
              <a
                href="/architecture/overview"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Layers className="h-4 w-4" />
                Overview
              </a>
              <a
                href="/architecture/data-flow"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Activity className="h-4 w-4" />
                Data Flow
              </a>
              <a
                href="/architecture/ai-engine"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Brain className="h-4 w-4" />
                AI Engine
              </a>
              <a
                href="/architecture/r2-lifecycle"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Database className="h-4 w-4" />
                R2 Lifecycle
              </a>
              <a
                href="/architecture/git-integration"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <GitBranch className="h-4 w-4" />
                Git Integration
              </a>
              <h4 className="mb-1 mt-4 rounded-md px-2 py-1 text-sm font-semibold">
                Examples
              </h4>
              <a
                href="/tutorials/node"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Server className="h-4 w-4" />
                Node.js
              </a>
              <a
                href="/tutorials/next"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <AppWindow className="h-4 w-4" />
                Next.js
              </a>
              <a
                href="/tutorials/vercel"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Triangle className="h-4 w-4" />
                Vercel
              </a>
              <a
                href="/tutorials/netlify"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Hexagon className="h-4 w-4" />
                Netlify
              </a>
              <a
                href="/tutorials/debug"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Bug className="h-4 w-4" />
                Debug Guide
              </a>

              <h4 className="mb-1 mt-4 rounded-md px-2 py-1 text-sm font-semibold">
                Reference
              </h4>
              <a
                href="/reference/config"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Settings className="h-4 w-4" />
                Config
              </a>
              <a
                href="/reference/events"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Activity className="h-4 w-4" />
                Event Schema
              </a>
              <a
                href="/reference/r2-layout"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Database className="h-4 w-4" />
                R2 Layout
              </a>
              <a
                href="/reference/state"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <TableProperties className="h-4 w-4" />
                State Schema
              </a>
              <a
                href="/reference/cli"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <Terminal className="h-4 w-4" />
                CLI
              </a>

              <h4 className="mb-1 mt-4 rounded-md px-2 py-1 text-sm font-semibold">
                Guides
              </h4>

              <a
                href="/install"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <span className="text-lg">📦</span>
                Installation
              </a>
              <a
                href="/opentelemetry"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <span className="text-lg">📡</span>
                OpenTelemetry
              </a>
              <a
                href="/r2-setup"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <span className="text-lg">☁️</span>
                R2 Storage
              </a>
              <a
                href="/github-bot"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <span className="text-lg">🤖</span>
                GitHub Bot
              </a>
              <a
                href="/running-agent"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <span className="text-lg">🚀</span>
                Running Agent
              </a>
              <a
                href="/troubleshooting"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
              >
                <span className="text-lg">🔧</span>
                Troubleshooting
              </a>
            </nav>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
