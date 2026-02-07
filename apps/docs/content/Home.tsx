import React from "react";
import { Button } from "../components/ui/button";

export function Home() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
          Welcome to Docs App
        </h1>
        <p className="text-xl text-muted-foreground">
          This is a standalone documentation application built with{" "}
          <strong>Bun</strong>, <strong>React</strong>, and <strong>MDX</strong>
          .
        </p>
      </div>

      <p className="leading-7 [&:not(:first-child)]:mt-6">
        It features a clean, "shadcn-style" UI with a dark mode toggle, sidebar
        navigation, and support for writing documentation in MDX.
      </p>

      <div className="border rounded-lg p-6 bg-card text-card-foreground shadow-sm">
        <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
          Features
        </h2>
        <ul className="my-6 ml-6 list-disc [&>li]:mt-2">
          <li>Lightning fast server with Bun</li>
          <li>React Server-Side Rendering (SSR)</li>
          <li>MDX support for rich documentation</li>
          <li>Clean, responsive customized styling</li>
          <li>Dark mode support out of the box</li>
        </ul>
      </div>

      <div className="flex flex-col gap-4 p-6 bg-muted rounded-lg">
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          Get Started
        </h3>
        <p className="text-muted-foreground">
          Check out the Getting Started guide to learn how to add new pages.
        </p>
        <div className="flex gap-4">
          <a href="/getting-started">
            <Button>Go to Getting Started</Button>
          </a>
          <a href="https://ui.shadcn.com" target="_blank" rel="noreferrer">
            <Button variant="outline">Shadcn UI Docs</Button>
          </a>
        </div>
      </div>
    </div>
  );
}
