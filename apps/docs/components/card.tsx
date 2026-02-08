import Link from "next/link";
import { cn } from "@/lib/utils";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  href?: string;
  disabled?: boolean;
}

export function Card({
  href,
  className,
  children,
  disabled,
  ...props
}: CardProps) {
  const content = (
    <div
      className={cn(
        "group relative rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md bg-card text-card-foreground",
        disabled && "cursor-not-allowed opacity-60",
        className,
      )}
      {...props}
    >
      <div className="flex flex-col space-y-2">{children}</div>
    </div>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

export function Cards({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2", className)}
      {...props}
    />
  );
}
