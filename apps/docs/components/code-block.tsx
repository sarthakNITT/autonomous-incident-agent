"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface CodeBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
}

export function CodeBlock({
  className,
  title,
  children,
  ...props
}: CodeBlockProps) {
  const [isCopied, setIsCopied] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

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
        "relative mb-4 mt-6 overflow-hidden rounded-lg border bg-muted/40 text-foreground",
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between bg-muted/40 px-4 py-2 border-b">
        <span className="text-xs font-medium text-muted-foreground">
          {title || "Code"}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:bg-background hover:text-foreground"
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
        <div ref={ref} className="font-mono text-sm leading-relaxed px-4">
          {children}
        </div>
      </div>
    </div>
  );
}
