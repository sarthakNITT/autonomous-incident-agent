export const GettingStarted = `
<!DOCTYPE html>
<html>
<head>
    <title>Getting Started - AIA Docs</title>
    <style>
        body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1, h2, h3 { color: #333; }
        code { background: #f4f4f4; padding: 2px 5px; border-radius: 3px; font-family: monospace; }
        pre { background: #222; color: #eee; padding: 15px; border-radius: 5px; overflow-x: auto; }
        a { color: #007bff; text-decoration: none; }
        a:hover { text-decoration: underline; }
        nav { background: #eee; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
        nav a { margin-right: 15px; font-weight: bold; }
    </style>
</head>
<body>
    <nav>
        <a href="/">Getting Started</a>
        <a href="/config">Configuration</a>
        <a href="/architecture">Architecture</a>
    </nav>

    <h1>Getting Started with AIA</h1>
    <p>Autonomous Incident Agent (AIA) is a self-healing system that automatically detects, analyzes, patches, and validates software incidents.</p>

    <h2>Quick Start</h2>
    <p>The easiest way to set up AIA is using the automated installer:</p>
    <pre>bun run cli/install.ts</pre>

    <h2>Prerequisites</h2>
    <ul>
        <li><strong>Bun</strong>: v1.0 or later</li>
        <li><strong>Git</strong>: Installed and configured</li>
        <li><strong>R2 Bucket</strong>: Or compatible S3 storage for artifacts</li>
        <li><strong>GitHub Token</strong>: With repo read/write permissions</li>
    </ul>

    <h2>Running the System</h2>
    <p>Start all services using the simplified start script (if available) or individual commands:</p>
    <pre>
# Terminal 1 - Router
bun run apps/router/src/index.ts

# Terminal 2 - Autopsy
bun run apps/autopsy/src/index.ts

# Terminal 3 - Git
bun run apps/git/src/index.ts

# Terminal 4 - State (DB)
bun run apps/state/src/index.ts

# Terminal 5 - Web Dashboard
bun run apps/web/src/server.ts
    </pre>

    <h2>Next Steps</h2>
    <p>Check out the <a href="/config">Configuration Reference</a> to customize behaviors.</p>
</body>
</html>
`;
