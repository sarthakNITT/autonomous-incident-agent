"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";

import { cn } from "@/lib/utils";
// Use relative path or alias if configured. Alias @/components/ui/button is correct.
import { Button } from "@/components/ui/button";

export function CodeBlock({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
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
        "relative mb-4 mt-6 rounded-lg border bg-zinc-950",
        className,
      )}
      {...props}
      ref={ref}
    >
      <div className="absolute right-4 top-4 z-20 flex items-center space-x-2">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-zinc-50 hover:bg-zinc-700 hover:text-zinc-50"
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
      <div className="relative overflow-x-auto rounded-lg py-4">
        <div className="font-mono text-sm leading-relaxed text-zinc-50 px-4">
          {children}
        </div>
      </div>
    </div>
  );
}
