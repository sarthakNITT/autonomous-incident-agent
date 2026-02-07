export const ConfigReference = `
<!DOCTYPE html>
<html>
<head>
    <title>Configuration - AIA Docs</title>
    <style>
        body { font-family: sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; line-height: 1.6; }
        h1, h2, h3 { color: #333; }
        code { background: #f4f4f4; padding: 2px 5px; border-radius: 3px; font-family: monospace; }
        pre { background: #222; color: #eee; padding: 15px; border-radius: 5px; overflow-x: auto; }
        a { color: #007bff; text-decoration: none; }
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

    <h1>Configuration Reference</h1>
    <p>AIA is configured via <code>aia.config.yaml</code> in the project root.</p>

    <h2>Project Settings</h2>
    <ul>
        <li><code>project_name</code>: Identifier for logs and reports.</li>
        <li><code>cluster_env</code>: Environment tag (e.g., prod, staging).</li>
    </ul>

    <h2>Services</h2>
    <p>Port and base URL configuration for internal communication.</p>
    <ul>
        <li><code>router</code>: Ingests alerts. Default: 3001</li>
        <li><code>autopsy</code>: Analyzes snapshots. Default: 3002</li>
        <li><code>git</code>: Manages PRs. Default: 3004</li>
        <li><code>repro</code>: Validates patches. Default: 3005</li>
        <li><code>state</code>: Database API. Default: 3006</li>
        <li><code>web</code>: User Dashboard. Default: 3007</li>
    </ul>

    <h2>Storage</h2>
    <p>R2 / S3 credential configuration.</p>
    <pre>
storage:
  provider: "r2"
  bucket: "my-bucket"
  access_key: "..."
  secret_key: "..."
  endpoint: "https://..."
  region: "auto"
    </pre>

    <h2>AI Provider</h2>
    <p>Configuration for the reasoning engine.</p>
    <pre>
ai:
  provider: "you.com"
  api_key: "..."
    </pre>
</body>
</html>
`;
