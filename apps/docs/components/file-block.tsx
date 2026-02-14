"use client";

import * as React from "react";
import {
  FileCode,
  FileJson,
  FileText,
  Terminal,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { FileBlockProvider } from "@/lib/file-block-context";

interface FileBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  filename: string;
  language?: string;
  showLineNumbers?: boolean;
}

export function FileBlock({
  className,
  filename,
  language,
  showLineNumbers = true,
  children,
  ...props
}: FileBlockProps) {
  const [isCopied, setIsCopied] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  const getIcon = (name: string) => {
    if (name.endsWith(".json")) return <FileJson className="h-4 w-4" />;
    if (name.endsWith(".ts") || name.endsWith(".tsx") || name.endsWith(".js"))
      return <FileCode className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const onCopy = () => {
    if (ref.current) {
      const text = ref.current.innerText;
      navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  return (
    <div
      className={cn(
        "file-block-wrapper relative mb-4 mt-6 overflow-hidden rounded-lg bg-[#0c0c0c] text-foreground",
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between bg-[#1a1a1a] px-4 py-2.5">
        <div className="flex items-center gap-2 text-muted-foreground">
          {getIcon(filename)}
          <span className="text-sm font-medium text-foreground/90">
            {filename}
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
          <span className="sr-only">Copy content</span>
        </Button>
      </div>
      <div className="overflow-x-auto py-4">
        <div
          ref={ref}
          className={cn(
            "font-mono text-[13px] leading-[1.6] px-4 text-zinc-400 tabular-nums whitespace-pre font-normal",
            showLineNumbers && "pl-4",
          )}
        >
          <FileBlockProvider>{children}</FileBlockProvider>
        </div>
      </div>
    </div>
  );
}
