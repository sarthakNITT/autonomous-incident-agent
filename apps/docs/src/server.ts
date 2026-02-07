import { serve } from "bun";
import { renderToReadableStream } from "react-dom/server";
import React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { evaluate } from "@mdx-js/mdx";
import { MainLayout } from "./layouts/MainLayout";
import { Home } from "./pages/Home";
import { join } from "path";

const PORT = 3000;

async function renderPage(title: string, content: React.ReactNode) {
  const stream = await renderToReadableStream(
    React.createElement(MainLayout, { title, children: content }),
  );
  return new Response(stream, {
    headers: { "Content-Type": "text/html" },
  });
}

async function loadMdx(filePath: string) {
  const fileContent = await Bun.file(filePath).text();
  const { default: Content } = await evaluate(fileContent, {
    ...(jsxRuntime as any),
    baseUrl: import.meta.url,
  });
  return React.createElement(Content);
}

const server = serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const { pathname } = url;
    console.log(`[Request] ${req.method} ${pathname}`);

    if (pathname === "/styles.css") {
      const cssPath = join(process.cwd(), "public", "styles.css");
      const file = Bun.file(cssPath);
      if (await file.exists()) {
        return new Response(file, { headers: { "Content-Type": "text/css" } });
      } else {
        return new Response("CSS not found", { status: 404 });
      }
    }

    try {
      if (pathname === "/") {
        return renderPage("Docs App - Home", React.createElement(Home));
      }

      if (pathname === "/getting-started") {
        const mdxContent = await loadMdx(
          join(process.cwd(), "src/pages/GettingStarted.mdx"),
        );
        return renderPage(
          "Getting Started",
          React.createElement("div", { className: "mdx-content" }, mdxContent),
        );
      }

      if (pathname === "/architecture") {
        const mdxContent = await loadMdx(
          join(process.cwd(), "src/pages/Architecture.mdx"),
        );
        return renderPage(
          "Architecture",
          React.createElement("div", { className: "mdx-content" }, mdxContent),
        );
      }

      if (pathname === "/architecture/overview") {
        const mdxContent = await loadMdx(
          join(process.cwd(), "src/pages/ArchitectureOverview.mdx"),
        );
        return renderPage(
          "Architecture Overview",
          React.createElement("div", { className: "mdx-content" }, mdxContent),
        );
      }

      if (pathname === "/architecture/data-flow") {
        const mdxContent = await loadMdx(
          join(process.cwd(), "src/pages/DataFlow.mdx"),
        );
        return renderPage(
          "Data Flow",
          React.createElement("div", { className: "mdx-content" }, mdxContent),
        );
      }

      if (pathname === "/architecture/ai-engine") {
        const mdxContent = await loadMdx(
          join(process.cwd(), "src/pages/AIEngine.mdx"),
        );
        return renderPage(
          "AI Engine",
          React.createElement("div", { className: "mdx-content" }, mdxContent),
        );
      }

      if (pathname === "/architecture/r2-lifecycle") {
        const mdxContent = await loadMdx(
          join(process.cwd(), "src/pages/R2Lifecycle.mdx"),
        );
        return renderPage(
          "R2 Lifecycle",
          React.createElement("div", { className: "mdx-content" }, mdxContent),
        );
      }

      if (pathname === "/architecture/git-integration") {
        const mdxContent = await loadMdx(
          join(process.cwd(), "src/pages/GitIntegration.mdx"),
        );
        return renderPage(
          "Git Integration",
          React.createElement("div", { className: "mdx-content" }, mdxContent),
        );
      }

      if (pathname === "/architecture/repro-pipeline") {
        const mdxContent = await loadMdx(
          join(process.cwd(), "src/pages/ReproPipeline.mdx"),
        );
        return renderPage(
          "Repro Pipeline",
          React.createElement("div", { className: "mdx-content" }, mdxContent),
        );
      }

      if (pathname === "/install") {
        const mdxContent = await loadMdx(
          join(process.cwd(), "src/pages/Install.mdx"),
        );
        return renderPage(
          "Installation",
          React.createElement("div", { className: "mdx-content" }, mdxContent),
        );
      }

      if (pathname === "/opentelemetry") {
        const mdxContent = await loadMdx(
          join(process.cwd(), "src/pages/OpenTelemetry.mdx"),
        );
        return renderPage(
          "OpenTelemetry",
          React.createElement("div", { className: "mdx-content" }, mdxContent),
        );
      }

      if (pathname === "/r2-setup") {
        const mdxContent = await loadMdx(
          join(process.cwd(), "src/pages/R2Setup.mdx"),
        );
        return renderPage(
          "R2 Setup",
          React.createElement("div", { className: "mdx-content" }, mdxContent),
        );
      }

      if (pathname === "/github-bot") {
        const mdxContent = await loadMdx(
          join(process.cwd(), "src/pages/GitHubBot.mdx"),
        );
        return renderPage(
          "GitHub Bot",
          React.createElement("div", { className: "mdx-content" }, mdxContent),
        );
      }

      if (pathname === "/running-agent") {
        const mdxContent = await loadMdx(
          join(process.cwd(), "src/pages/RunningAgent.mdx"),
        );
        return renderPage(
          "Running the Agent",
          React.createElement("div", { className: "mdx-content" }, mdxContent),
        );
      }

      if (pathname === "/troubleshooting") {
        const mdxContent = await loadMdx(
          join(process.cwd(), "src/pages/Troubleshooting.mdx"),
        );
        return renderPage(
          "Troubleshooting",
          React.createElement("div", { className: "mdx-content" }, mdxContent),
        );
      }
    } catch (e) {
      console.error("Error handling request:", e);
      return new Response(
        "Internal Server Error\n" + (e instanceof Error ? e.stack : String(e)),
        { status: 500 },
      );
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Docs app listening on http://localhost:${server.port}`);
