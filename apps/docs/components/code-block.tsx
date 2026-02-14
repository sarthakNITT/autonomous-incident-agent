"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { useFileBlock } from "@/lib/file-block-context";

interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  icon?: React.ReactNode;
}

export function CodeBlock({
  className,
  title,
  icon,
  children,
  ...props
}: CodeBlockProps) {
  const [isCopied, setIsCopied] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);
  const { isInFileBlock } = useFileBlock();

  if (isInFileBlock) {
    return <>{children}</>;
  }

  const onCopy = () => {
    if (ref.current) {
      navigator.clipboard.writeText(ref.current.innerText);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div
      className={cn(
        "code-block relative mb-4 mt-6 overflow-hidden rounded-lg bg-[#0c0c0c] text-foreground",
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between bg-[#1a1a1a] px-4 py-2.5">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs font-medium text-foreground/80">
            {title || "Terminal"}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-transparent"
          onClick={onCopy}
        >
          {isCopied ? (
            <Check className="h-3 w-3" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          <span className="sr-only">Copy code</span>
        </Button>
      </div>
      <div className="overflow-x-auto py-4">
        <div
          ref={ref}
          className="font-mono text-[13px] leading-[1.6] px-4 text-zinc-400 tabular-nums"
        >
          {children}
        </div>
      </div>
    </div>
  );
}
