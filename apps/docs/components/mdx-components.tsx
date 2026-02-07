import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import Image from "next/image";
import { CodeBlock } from "@/components/code-block";
import { cn } from "@/lib/utils";

// Utility to slugify headings for anchors
function slugify(str: string) {
  return str
    .toString()
    .toLowerCase()
    .trim() // trim leading/trailing spaces
    .replace(/\s+/g, "-") // replace spaces with -
    .replace(/&/g, "-and-") // replace & with -and-
    .replace(/[^\w\-]+/g, "") // remove all non-word chars
    .replace(/\-\-+/g, "-"); // replace multiple - with single -
}

export const components: MDXComponents = {
  h1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className={cn(
        "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mb-8",
        className,
      )}
      {...props}
    />
  ),
  h2: ({
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const id = slugify(typeof children === "string" ? children : "");
    return (
      <h2
        id={id}
        className={cn(
          "scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0 mt-10 mb-4",
          className,
        )}
        {...props}
      >
        {children}
      </h2>
    );
  },
  h3: ({
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const id = slugify(typeof children === "string" ? children : "");
    return (
      <h3
        id={id}
        className={cn(
          "scroll-m-20 text-2xl font-semibold tracking-tight mt-8 mb-4",
          className,
        )}
        {...props}
      >
        {children}
      </h3>
    );
  },
  h4: ({
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) => {
    const id = slugify(typeof children === "string" ? children : "");
    return (
      <h4
        id={id}
        className={cn(
          "scroll-m-20 text-xl font-semibold tracking-tight mt-6 mb-4",
          className,
        )}
        {...props}
      >
        {children}
      </h4>
    );
  },
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className={cn("leading-7 [&:not(:first-child)]:mt-6", className)}
      {...props}
    />
  ),
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className={cn("my-6 ml-6 list-disc [&>li]:mt-2", className)}
      {...props}
    />
  ),
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className={cn("my-6 ml-6 list-decimal [&>li]:mt-2", className)}
      {...props}
    />
  ),
  li: ({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className={cn("mt-2", className)} {...props} />
  ),
  blockquote: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <blockquote
      className={cn(
        "mt-6 border-l-2 pl-6 italic text-muted-foreground",
        className,
      )}
      {...props}
    />
  ),
  img: (props: any) => (
    <img
      className={cn("rounded-md border my-4 w-full", props.className)}
      alt={props.alt}
      {...props}
    />
  ),
  hr: ({ ...props }) => <hr className="my-4 md:my-8" {...props} />,
  table: ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 w-full overflow-y-auto">
      <table className={cn("w-full", className)} {...props} />
    </div>
  ),
  tr: ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr
      className={cn("m-0 border-t p-0 even:bg-muted", className)}
      {...props}
    />
  ),
  th: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className={cn(
        "border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right",
        className,
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td
      className={cn(
        "border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right",
        className,
      )}
      {...props}
    />
  ),
  pre: ({
    className,
    children,
    ...props
  }: React.HTMLAttributes<HTMLPreElement>) => {
    // In next-mdx-remote, `pre` usually wraps a `code` block.
    // We want to pass the content to CodeBlock.
    return (
      <CodeBlock className={className} {...(props as any)}>
        {children}
      </CodeBlock>
    );
  },
  code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code
      className={cn(
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-foreground",
        className,
      )}
      {...props}
    />
  ),
  a: ({
    className,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
    // Handle internal vs external links?
    // Simplified:
    return (
      <Link
        href={href as string}
        className={cn(
          "font-medium text-primary underline underline-offset-4",
          className,
        )}
        {...props}
      />
    );
  },
};
