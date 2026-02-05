import type { AutopsyResult } from "@repo/types";
import { join } from "path";
import { loadConfig } from "../../../shared/config_loader";
import { R2Client } from "@repo/storage";
import { generatePdfReport } from "./export";

const config = loadConfig();
const PORT = config.services.dashboard.port;

const storage = new R2Client(config.storage);

const server = Bun.serve({
    port: PORT,
    async fetch(req) {
        const url = new URL(req.url);

        if (req.method === "GET" && url.pathname === "/") {
            const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Autonomous Incident Dashboard</title>
                <style>
                    body { font-family: sans-serif; padding: 20px; }
                    .incident { border: 1px solid #ccc; padding: 15px; margin-bottom: 10px; border-radius: 5px; }
                    .critical { border-left: 5px solid red; }
                    pre { background: #f4f4f4; padding: 10px; overflow-x: auto; }
                    .download-btn { background: #007bff; color: white; padding: 5px 10px; text-decoration: none; border-radius: 3px; }
                </style>
            </head>
            <body>
                <h1>Autonomous Incident Dashboard</h1>
                <div id="incidents">Loading...</div>
                <script>
                    async function load() {
                        const res = await fetch("/api/incidents");
                        const data = await res.json();
                        const container = document.getElementById("incidents");
                        container.innerHTML = data.incidents.map(i => \`
                            <div class="incident \${i.severity}">
                                <h3>Incident: \${i.id}</h3>
                                <p><strong>Service:</strong> \${i.service_name}</p>
                                <p><strong>Status:</strong> \${i.status}</p>
                                <details>
                                    <summary>Root Cause Analysis</summary>
                                    <pre>\${i.autopsy ? i.autopsy.root_cause_text : 'Pending Analysis...'}</pre>
                                </details>
                                <details>
                                    <summary>Suggested Patch</summary>
                                    <pre>\${i.patch_diff || 'No patch available'}</pre>
                                </details>
                                <div style="margin-top: 10px;">
                                    <a href="/export/\${i.id}" class="download-btn" target="_blank">Download PDF Report</a>
                                </div>
                            </div>
                        \`).join("");
                    }
                    load();
                </script>
            </body>
            </html>
            `;
            return new Response(html, { headers: { "Content-Type": "text/html" } });
        }

        if (req.method === "GET" && url.pathname === "/api/incidents") {
            try {
                const res = await fetch(`${config.services.state.base_url}/incidents`);
                const incidents = await res.json();
                return new Response(JSON.stringify(incidents), {
                    headers: { "Content-Type": "application/json" }
                });
            } catch (e) {
                console.error("Dashboard failed to fetch incidents", e);
                return new Response(JSON.stringify([]), { headers: { "Content-Type": "application/json" } });
            }
        }

        if (url.pathname.startsWith("/export/")) {
            const incidentId = url.pathname.split("/")[2];
            if (incidentId) {
                try {
                    console.log(`Generating PDF for ${incidentId}...`);

                    let autopsyJson = null;
                    let patchDiff = "";
                    let preLog = "";

                    try { autopsyJson = await storage.downloadJSON(`incidents/${incidentId}/autopsy.json`); } catch (e) { }
                    try { patchDiff = await storage.downloadText(`incidents/${incidentId}/patch.diff`); } catch (e) { }
                    try { preLog = await storage.downloadText(`incidents/${incidentId}/logs/pre.txt`); } catch (e) { }

                    const pdfPath = await generatePdfReport(incidentId, {
                        autopsy: autopsyJson as AutopsyResult,
                        patch: patchDiff,
                        logs: preLog
                    });

                    const file = Bun.file(pdfPath);
                    return new Response(file);
                } catch (e) {
                    console.error("Export failed", e);
                    return new Response("Export failed", { status: 500 });
                }
            }
        }

        return new Response("Not Found", { status: 404 });
    },
});

console.log(`Dashboard listening on http://localhost:${PORT}`);
