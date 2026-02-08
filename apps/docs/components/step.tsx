import { cn } from "@/lib/utils";

export function Steps({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "ml-4 mb-12 border-l border-zinc-800 pl-8 [counter-reset:step]",
        className,
      )}
      {...props}
    />
  );
}

export function Step({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("relative mt-8 pt-2 [counter-increment:step]", className)}
      {...props}
    >
      <div className="absolute -left-[41px] top-3 flex h-6 w-6 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-[10px] font-bold text-zinc-400 ring-4 ring-zinc-950 before:content-[counter(step)]" />
      {children}
    </div>
  );
}
