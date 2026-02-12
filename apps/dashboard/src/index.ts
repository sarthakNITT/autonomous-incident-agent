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
      console.log("[Dashboard] Serving main dashboard page");
      const html = `
            <!DOCTYPE html>
            <html>

            <head>
                <title>Autonomous Incident Dashboard</title>
            <style>
                    body { font-family: sans-serif; padding: 20px; }
                    .incident { border: 1px solid #ccc; padding: 15px; margin-bottom: 20px; border-radius: 5px; }
                    .critical { border-left: 5px solid red; }
                    pre { background: #f4f4f4; padding: 10px; overflow-x: auto; }
                    .download-btn { background: #007bff; color: white; padding: 5px 10px; text-decoration: none; border-radius: 3px; }
                    
                    .prompt-container { margin-top: 15px; background: #e8f0fe; padding: 10px; border-radius: 5px; border-left: 4px solid #4285f4; }
                    .prompt-text { font-family: monospace; white-space: pre-wrap; margin-bottom: 10px; }
                    .copy-btn { background: #4285f4; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 3px; font-size: 0.8em;}
                    
                    .manual-steps { margin-top: 15px; background: #fff3e0; padding: 10px; border-radius: 5px; border-left: 4px solid #ff9800; }
                    .manual-steps ul { padding-left: 20px; margin: 0; }
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
                        
                        const renderIncident = async (i) => {
                            let autopsy = i.autopsy;
                            // Attempt to fetch full autopsy if missing fields
                            if (!autopsy || !autopsy.fix_prompt) {
                                try {
                                    const aRes = await fetch(\`/api/incidents/\${i.id}/autopsy\`);
                                    if(aRes.ok) {
                                        const fullAutopsy = await aRes.json();
                                        if(fullAutopsy && fullAutopsy.root_cause_text) {
                                             autopsy = fullAutopsy;
                                        }
                                    }
                                } catch(e) {}
                            }

                            const promptHtml = autopsy && autopsy.fix_prompt ? \`
                                <div class="prompt-container">
                                    <strong>AI Fix Prompt (Paste into Agent)</strong>
                                    <div class="prompt-text" id="prompt-\${i.id}">\${autopsy.fix_prompt}</div>
                                    <button class="copy-btn" onclick="navigator.clipboard.writeText(document.getElementById('prompt-\${i.id}').innerText)">Copy Prompt</button>
                                </div>
                            \` : '';

                            const stepsHtml = autopsy && autopsy.manual_steps && autopsy.manual_steps.length ? \`
                                <div class="manual-steps">
                                    <strong>Manual Fix Steps</strong>
                                    <ul>
                                        \${autopsy.manual_steps.map(step => \`<li>\${step}</li>\`).join('')}
                                    </ul>
                                </div>
                            \` : '';

                            return \`
                            <div class="incident \${i.severity}">
                                <div style="display: flex; justify-content: space-between; align-items: start;">
                                    <h3>Incident: \${i.id}</h3>
                                    <span style="font-size: 0.8em; color: #666;">Detected: \${new Date(i.created_at).toLocaleString()}</span>
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; font-size: 0.9em; background: #fafafa; padding: 10px; border-radius: 5px;">
                                    <div><strong>Service:</strong> \${i.service_name}</div>
                                    <div><strong>Status:</strong> \${i.status}</div>
                                    <div><strong>Repo:</strong> \${i.repo_name || 'N/A'}</div>
                                    <div><strong>File:</strong> \${i.file_path || 'N/A'}</div>
                                </div>

                                <details>
                                    <summary>Root Cause Analysis</summary>
                                    <pre>\${autopsy ? autopsy.root_cause_text : 'Pending Analysis...'}</pre>
                                </details>
                                <details>
                                    <summary>Suggested Patch</summary>
                                    <pre>\${i.patch_diff || 'No patch available'}</pre>
                                </details>
                                
                                \${promptHtml}
                                \${stepsHtml}

                                <div style="margin-top: 10px;">
                                    <a href="/export/\${i.id}" class="download-btn" target="_blank">Download PDF Report</a>
                                </div>
                            </div>
                        \`;
                        };

                        const htmlPromises = data.incidents.map(renderIncident);
                        const htmlParts = await Promise.all(htmlPromises);
                        container.innerHTML = htmlParts.join("");
                    }
                    load();
                </script>
            </body>
            </html>
            `;
      return new Response(html, { headers: { "Content-Type": "text/html" } });
    }

    if (req.method === "GET" && url.pathname === "/api/incidents") {
      console.log("[Dashboard] Fetching incidents list...");
      try {
        const res = await fetch(`${config.services.state.base_url}/incidents`);
        if (!res.ok) {
          console.error(
            `[Dashboard] Failed to fetch from state: ${res.status}`,
          );
          throw new Error(`State service error: ${res.status}`);
        }
        const incidents = await res.json();
        console.log(`[Dashboard] Retrieved ${incidents.length} incidents`);
        return new Response(JSON.stringify({ incidents }), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (e) {
        console.error("Dashboard failed to fetch incidents", e);
        return new Response(JSON.stringify({ incidents: [] }), {
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    if (
      req.method === "GET" &&
      url.pathname.startsWith("/api/incidents/") &&
      url.pathname.endsWith("/autopsy")
    ) {
      const incidentId = url.pathname.split("/")[3];
      try {
        const autopsyJson = await storage.downloadJSON(
          `incidents/${incidentId}/autopsy.json`,
        );
        return new Response(JSON.stringify(autopsyJson), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (e) {
        return new Response("{}", {
          headers: { "Content-Type": "application/json" },
        });
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

          try {
            autopsyJson = await storage.downloadJSON(
              `incidents/${incidentId}/autopsy.json`,
            );
          } catch (e) {}
          try {
            patchDiff = await storage.downloadText(
              `incidents/${incidentId}/patch.diff`,
            );
          } catch (e) {}
          try {
            preLog = await storage.downloadText(
              `incidents/${incidentId}/logs/pre.txt`,
            );
          } catch (e) {}

          const pdfPath = await generatePdfReport(incidentId, {
            autopsy: autopsyJson as AutopsyResult,
            patch: patchDiff,
            logs: preLog,
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
