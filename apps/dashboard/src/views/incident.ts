import type { AutopsyResult } from "@repo/types";

export function renderIncidentView(
    autopsy: AutopsyResult,
    prDescription: string,
    preLogs: string,
    postLogs: string
): string {
    const timestamp = new Date().toISOString();

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Incident Report: incident-1</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; max-width: 900px; margin: 0 auto; padding: 20px; color: #333; }
        h1, h2, h3 { color: #111; }
        .header { border-bottom: 2px solid #eaeaea; padding-bottom: 10px; margin-bottom: 20px; }
        .meta { color: #666; font-size: 0.9em; margin-bottom: 20px; }
        .section { background: #f9f9f9; padding: 20px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #eee; }
        .code-block { background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 4px; overflow-x: auto; font-family: 'Menlo', 'Monaco', 'Courier New', monospace; font-size: 0.9em; }
        .timeline { display: flex; align-items: center; justify-content: space-between; margin: 30px 0; padding: 20px; background: #fff; border: 1px solid #ddd; border-radius: 8px; }
        .timeline-item { text-align: center; flex: 1; position: relative; }
        .timeline-item::after { content: '→'; position: absolute; right: -10px; top: 0; color: #ccc; }
        .timeline-item:last-child::after { content: ''; }
        .status-ok { color: green; font-weight: bold; }
        .status-fail { color: red; font-weight: bold; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 0.8em; font-weight: bold; }
        .badge-critical { background: #ffebee; color: #c62828; }
        a.btn { display: inline-block; background: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; }
        a.btn:hover { background: #0051a2; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Autonomous Incident Report</h1>
        <div class="meta">
            <span>ID: incident-1</span> • 
            <span>Generated: ${timestamp}</span> • 
            <span class="badge badge-critical">CRITICAL</span>
        </div>
    </div>

    <div class="section">
        <h2>Timeline & Resolution Flow</h2>
        <div class="timeline">
            <div class="timeline-item">
                <div>🚨 <strong>Detection</strong></div>
                <div class="meta">Log Pattern Match</div>
            </div>
            <div class="timeline-item">
                <div>📥 <strong>Ingest</strong></div>
                <div class="meta">Event Router</div>
            </div>
            <div class="timeline-item">
                <div>🔍 <strong>Autopsy</strong></div>
                <div class="meta">Root Cause Analysis</div>
            </div>
            <div class="timeline-item">
                <div>🛠 <strong>Resolution</strong></div>
                <div class="meta">Patch & PR Generated</div>
            </div>
            <div class="timeline-item">
                <div>✅ <strong>Verification</strong></div>
                <div class="meta">Reproduction Harness</div>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>Root Cause Analysis</h2>
        <p><strong>Diagnosis:</strong> ${autopsy.root_cause_text}</p>
        <p><strong>Confidence:</strong> ${(autopsy.confidence * 100).toFixed(0)}%</p>
        <p><strong>Location:</strong> <code>${autopsy.file_path}:${autopsy.line_range}</code></p>
    </div>

    <div class="section">
        <h2>Generated Patch</h2>
        <pre class="code-block">${autopsy.suggested_patch.patch_diff}</pre>
    </div>

    <div class="section">
        <h2>Pull Request Description</h2>
        <pre style="white-space: pre-wrap; font-family: inherit;">${prDescription}</pre>
    </div>

    <div class="section">
        <h2>Automated Verification</h2>
        <div style="display: flex; gap: 20px;">
            <div style="flex: 1;">
                <h3>Pre-Patch (Failure Reproduction)</h3>
                <pre class="code-block" style="color: #ff9999;">${preLogs}</pre>
            </div>
            <div style="flex: 1;">
                <h3>Post-Patch (Fix Verification)</h3>
                <pre class="code-block" style="color: #99ff99;">${postLogs}</pre>
            </div>
        </div>
    </div>

</body>
</html>
    `;
}
