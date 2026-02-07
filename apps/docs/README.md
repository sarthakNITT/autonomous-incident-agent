# Docs App

A standalone documentation web application built with **Bun**, **React**, **MDX**, and **Shadcn/UI**.

This app features a custom server implementation that supports Server-Side Rendering (SSR) of React components and MDX content, styled with Tailwind CSS and Radix UI primitives.

## Architecture

- [Overview](/src/pages/ArchitectureOverview.mdx)
- [Data Flow](/src/pages/DataFlow.mdx)
- [AI Engine](/src/pages/AIEngine.mdx)
- [R2 Lifecycle](/src/pages/R2Lifecycle.mdx)
- [Git Integration](/src/pages/GitIntegration.mdx)
- [Repro Pipeline](/src/pages/ReproPipeline.mdx)

## Examples

- [Node.js Tutorial](/src/pages/TutorialNode.mdx)
- [Next.js Tutorial](/src/pages/TutorialNext.mdx)
- [Vercel Deployment](/src/pages/TutorialVercel.mdx)
- [Netlify Integration](/src/pages/TutorialNetlify.mdx)
- [Debugging Guide](/src/pages/DebugGuide.mdx)

## Reference

- [Configuration](/src/pages/ConfigReference.mdx)
- [Event Schema](/src/pages/EventSchema.mdx)
- [R2 Layout](/src/pages/R2Layout.mdx)
- [State Schema](/src/pages/StateSchema.mdx)
- [CLI Commands](/src/pages/CLIReference.mdx)

## Documentation

- [Installation](/src/pages/Install.mdx)
- [OpenTelemetry Integration](/src/pages/OpenTelemetry.mdx)
- [R2 Storage Setup](/src/pages/R2Setup.mdx)
- [GitHub Bot Setup](/src/pages/GitHubBot.mdx)
- [Running the Agent](/src/pages/RunningAgent.mdx)
- [Troubleshooting](/src/pages/Troubleshooting.mdx)

## Getting Started

### Prerequisites

- [Bun](https://bun.sh) (latest version)

### Installation

```bash
cd apps/docs
bun install
```

### Running the App

To start the development server with Tailwind CSS watching:

```bash
bun run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Styling

The app uses **Tailwind CSS** with **Shadcn/UI** components.
The CSS is built from `src/globals.css` to `public/styles.css` using the Tailwind CLI.

Themes (dark/light) are handled via CSS variables and a toggle in the Navbar.

## Folder Structure

```
apps/docs/
├── public/
│   └── styles.css       # Generated Tailwind styles
├── src/
│   ├── components/      # UI components (Sidebar, Navbar)
│   │   └── ui/          # Shadcn primitives (Button, Sheet, etc.)
│   ├── layouts/         # Layout components (MainLayout)
│   ├── lib/             # Utilities (cn, etc.)
│   ├── pages/           # Content pages (TSX and MDX)
│   ├── server.ts        # Custom Bun server & router
│   └── globals.css      # Tailwind directives & CSS variables
├── package.json
├── tailwind.config.js
└── README.md
```

## Adding New Pages

1.  **Create a Page File**:
    - For standard React pages, create a `.tsx` file in `src/pages/` (e.g., `MyPage.tsx`).
    - For documentation content, create a `.mdx` file in `src/pages/` (e.g., `MyDoc.mdx`).

2.  **Update the Server Routing**:
    - Open `src/server.ts`.
    - Add a new route handler in the `fetch` function to map a URL path to your file.

    ```typescript
    if (pathname === "/my-doc") {
      const mdxContent = await loadMdx(
        join(process.cwd(), "src/pages/MyDoc.mdx"),
      );
      return renderPage(
        "My Document",
        React.createElement("div", { className: "mdx-content" }, mdxContent),
      );
    }
    ```

3.  **Update the Sidebar**:
    - Open `src/components/Sidebar.tsx`.
    - Add a new link to the navigation list.

## Features

- **Custom Bun Server**: Optimized for speed and simplicity.
- **React SSR**: Fast initial load and SEO-friendly.
- **MDX Support**: Write documentation using Markdown mixed with React components.
- **Shadcn/UI**: Beautiful, accessible components built with Radix UI and Tailwind CSS.
- **Theming**: Dark/Light mode support.
