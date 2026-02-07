export const Architecture = `
<!DOCTYPE html>
<html>
<head>
    <title>Architecture - AIA Docs</title>
    <style>
        body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1, h2, h3 { color: #333; }
        nav { background: #eee; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
        nav a { margin-right: 15px; font-weight: bold; }
        .diagram { border: 1px solid #ddd; padding: 20px; background: #f9f9f9; border-radius: 5px; text-align: center; }
    </style>
</head>
<body>
    <nav>
        <a href="/">Getting Started</a>
        <a href="/config">Configuration</a>
        <a href="/architecture">Architecture</a>
    </nav>

    <h1>System Architecture</h1>
    
    <h2>Workflow</h2>
    <div class="diagram">
        Router (Alert) &rarr; Autopsy (Analyze) &rarr; Git (PR) &rarr; Repro (Validate) &rarr; State (DB) &rarr; Web (Dashboard)
    </div>

    <h3>Components</h3>
    <ul>
        <li><strong>Router</strong>: Ingests alerts via webhooks and captures snapshots.</li>
        <li><strong>State Service</strong>: Central source of truth (SQLite), tracking incident lifecycle.</li>
        <li><strong>Autopsy</strong>: AI-driven root cause analysis and patch generation.</li>
        <li><strong>Git Service</strong>: Automates branch creation and Pull Requests.</li>
        <li><strong>Repro</strong>: Spawns isolated Docker containers to validate patches.</li>
        <li><strong>Web Dashboard</strong>: User interface for monitoring and manual approvals.</li>
    </ul>

    <h2>Data Flow</h2>
    <ol>
        <li>Alert received by Router.</li>
        <li>Snapshot stored in R2.</li>
        <li>Incident created in State DB.</li>
        <li>Autopsy downloads snapshot, queries AI, generates patch.</li>
        <li>Git service creates PR with patch.</li>
        <li>Repro service runs tests against patched code.</li>
        <li>Web dashboard displays results for human review.</li>
    </ol>
</body>
</html>
`;
