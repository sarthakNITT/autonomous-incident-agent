"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, Copy } from "lucide-react";

const TabsContext = React.createContext<{
  activeTab: string;
  setActiveTab: (value: string) => void;
} | null>(null);

export function Tabs({
  defaultValue,
  className,
  children,
}: {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [activeTab, setActiveTab] = React.useState(defaultValue);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div
        className={cn(
          "group relative mt-4 mb-4 overflow-hidden rounded-xl border border-zinc-800 bg-[#0c0c0c]",
          className,
        )}
      >
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 border-b border-zinc-800 bg-[#121212] px-4 py-2.5",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsTrigger must be used within Tabs");

  const isActive = context.activeTab === value;

  return (
    <button
      onClick={() => context.setActiveTab(value)}
      className={cn(
        "flex items-center justify-center whitespace-nowrap px-3 py-1 text-xs font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 rounded-sm",
        isActive
          ? "bg-zinc-950 text-foreground shadow-sm"
          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error("TabsContent must be used within Tabs");

  if (context.activeTab !== value) return null;

  return (
    <div
      data-state="active"
      className={cn(
        "p-0 [&_pre]:my-0 [&_pre]:bg-transparent [&_code]:font-normal [&_code]:opacity-50",
        "[_&_.code-block]:my-0 [_&_.code-block]:border-none [_&_.code-block]:bg-transparent [_&_.code-block]:rounded-none [_&_.code-block>div:first-child]:hidden",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TabsCopyButton({ className }: { className?: string }) {
  const [hasCopied, setHasCopied] = React.useState(false);

  const runCopy = React.useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const container = e.currentTarget.closest(".group");
      if (!container) return;

      // Find the active tab content within this group
      const activeContent = container.querySelector('[data-state="active"]');
      if (!activeContent) return;

      // Try to find code element or just take text content
      const codeElement =
        activeContent.querySelector("code") ||
        activeContent.querySelector("pre");
      const textToCopy = codeElement
        ? codeElement.innerText
        : activeContent.textContent || "";

      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy);
        setHasCopied(true);
        setTimeout(() => setHasCopied(false), 2000);
      }
    },
    [],
  );

  return (
    <button
      onClick={runCopy}
      className={cn(
        "ml-auto flex h-6 w-6 items-center justify-center rounded-md hover:bg-zinc-800/50 text-zinc-400 transition-colors",
        className,
      )}
    >
      {hasCopied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
      <span className="sr-only">Copy</span>
    </button>
  );
}
