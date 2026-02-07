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
        "relative mb-4 mt-6 overflow-hidden rounded-[8px] bg-card/70 text-foreground",
        className,
      )}
      {...props}
    >
      <div className="flex h-[32px] items-center justify-between bg-muted/40 px-0 backdrop-blur-[6px]">
        <div className="flex h-full items-center">
          <div className="flex h-full items-center justify-center bg-card px-4 text-[13px] font-medium font-mono text-foreground">
            {title || "index.ts"}
          </div>
        </div>
        <div className="flex items-center pr-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:bg-transparent hover:text-foreground opacity-70 hover:opacity-100 transition-opacity"
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
      </div>
      <div className="overflow-x-auto py-4">
        <div ref={ref} className="font-mono text-[13px] leading-[1.7] px-4">
          {children}
        </div>
      </div>
    </div>
  );
}
