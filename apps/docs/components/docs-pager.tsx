"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { sidebarItems } from "@/lib/docs-config";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

// Helper to flatten the sidebar items
function getFlattenedItems() {
  return sidebarItems.flatMap((group) => group.items);
}

export function DocsPager() {
  const pathname = usePathname();
  const items = getFlattenedItems();

  if (!pathname || !items.length) {
    return null;
  }

  const activeIndex = items.findIndex((item) => item.href === pathname);

  if (activeIndex === -1) {
    return null;
  }

  const prev = activeIndex > 0 ? items[activeIndex - 1] : null;
  const next = activeIndex < items.length - 1 ? items[activeIndex + 1] : null;

  return (
    <div className="mt-16 flex flex-row items-center justify-between">
      {prev ? (
        <Link
          href={prev.href}
          className="group flex flex-row items-center justify-center rounded-lg border border-zinc-800 bg-[#18181b] px-4 py-3 text-sm font-medium text-zinc-400 transition-colors hover:border-zinc-700 hover:text-foreground"
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          <span className="truncate">{prev.title}</span>
        </Link>
      ) : (
        <div />
      )}

      {next && (
        <Link
          href={next.href}
          className="group flex flex-row items-center justify-center rounded-lg border border-zinc-800 bg-[#18181b] px-4 py-3 text-sm font-medium text-zinc-400 transition-colors hover:border-zinc-700 hover:text-foreground"
        >
          <span className="truncate">{next.title}</span>
          <ChevronRight className="ml-2 h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
