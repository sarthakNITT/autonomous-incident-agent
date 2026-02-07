import type { MDXComponents } from "mdx/types";
import Link from "next/link";
import Image from "next/image";
import { CodeBlock } from "@/components/code-block";
import { cn } from "@/lib/utils";

function slugify(str: string) {
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export const components: MDXComponents = {
  h1: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1
      className={cn(
        "scroll-m-20 text-[36px] font-bold tracking-tight mb-5",
        className,
      )}
      style={{ letterSpacing: "-0.02em" }}
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
          "group scroll-m-20 pb-2 text-[24px] font-semibold tracking-tight transition-colors first:mt-0 mt-7 mb-3",
          className,
        )}
        style={{ letterSpacing: "-0.01em" }}
        {...props}
      >
        <a
          href={`#${id}`}
          className="no-underline hover:underline hover:decoration-muted-foreground/50 transition-all opacity-0 group-hover:opacity-80 duration-120 absolute -ml-6"
          aria-label="Link to section"
        >
          #
        </a>
        {children}
      </h2>
    );
  },
  h3: ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3
      className={cn(
        "scroll-m-20 text-[20px] font-semibold tracking-tight mt-5 mb-4",
        className,
      )}
      {...props}
    />
  ),
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
          "group scroll-m-20 text-lg font-semibold tracking-tight mt-6 mb-4",
          className,
        )}
        {...props}
      >
        <a
          href={`#${id}`}
          className="hover:underline underline-offset-4 decoration-muted-foreground/50"
        >
          {children}
        </a>
      </h4>
    );
  },
  p: ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p
      className={cn(
        "text-[15px] leading-[1.8] text-muted-foreground [&:not(:first-child)]:my-5",
        className,
      )}
      {...props}
    />
  ),
  ul: ({ className, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul
      className={cn(
        "my-6 ml-6 list-disc [&>li]:mt-2 marker:text-muted-foreground pl-[18px]",
        className,
      )}
      {...props}
    />
  ),
  ol: ({ className, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol
      className={cn(
        "my-6 ml-6 list-decimal [&>li]:mt-2 marker:text-muted-foreground",
        className,
      )}
      {...props}
    />
  ),
  li: ({ className, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className={cn("mt-2", className)} {...props} />
  ),
  blockquote: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <blockquote
      className={cn("mt-6 pl-6 italic text-muted", className)}
      {...props}
    />
  ),
  img: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img
      className={cn("rounded-md my-4 w-full", props.className)}
      alt={props.alt || ""}
      {...props}
    />
  ),
  hr: ({ ...props }) => <hr className="my-4 md:my-8" {...props} />,
  table: ({ className, ...props }: React.HTMLAttributes<HTMLTableElement>) => (
    <div className="my-6 w-full overflow-y-auto rounded-[6px]">
      <table className={cn("w-full text-sm", className)} {...props} />
    </div>
  ),
  tr: ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
    <tr className={cn("m-0 p-0 even:bg-muted/25", className)} {...props} />
  ),
  th: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <th
      className={cn(
        "px-4 py-2 text-left font-bold bg-muted/40 [&[align=center]]:text-center [&[align=right]]:text-right",
        className,
      )}
      {...props}
    />
  ),
  td: ({ className, ...props }: React.HTMLAttributes<HTMLTableCellElement>) => (
    <td
      className={cn(
        "px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right text-muted-foreground",
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
    return (
      <CodeBlock
        className={className}
        {...(props as React.ComponentProps<typeof CodeBlock>)}
      >
        {children}
      </CodeBlock>
    );
  },
  code: ({ className, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code
      className={cn(
        "relative rounded bg-card px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold text-foreground",
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
