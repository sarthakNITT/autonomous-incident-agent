import type { AutopsyResult } from "@repo/types";
import { loadConfig } from "../../../shared/config_loader";
import { R2Client } from "@repo/storage";

const config = loadConfig();
const PORT = config.services.dashboard.port;

const storage = new R2Client(config.storage);

const server = Bun.serve({
    port: PORT,
    async fetch(req) {
        const url = new URL(req.url);

        // List Incidents
        if (url.pathname === "/" || url.pathname === "/index.html") {
            try {
                // List all keys
                // We expect incidents/{id}/...
                // R2 listKeys returns flat list. We need to group.
                // Assuming < 1000 keys for demo.
                const keys = await storage.listKeys("incidents/");
                // Extract IDs
                const incidentIds = new Set<string>();
                keys.forEach(k => {
                    const parts = k.split("/");
                    // incidents / {id} / {file}
                    if (parts.length >= 2) {
                        incidentIds.add(parts[1]);
                    }
                });

                const listHtml = Array.from(incidentIds).map(id =>
                    `<li><a href="/incident/${id}">${id}</a></li>`
                ).join("");

                return new Response(`
                    <h1>Incident Dashboard</h1>
                    <h2>Detected Incidents (R2)</h2>
                    <ul>${listHtml || "<li>No incidents found</li>"}</ul>
                `, { headers: { "Content-Type": "text/html" } });

            } catch (e) {
                return new Response(`Error listing incidents: ${e}`, { status: 500 });
            }
        }

        // View Incident
        // /incident/:id
        const pathParts = url.pathname.split("/");
        if (pathParts[1] === "incident" && pathParts[2]) {
            const incidentId = pathParts[2];
            try {
                // Fetch artifacts
                let autopsyJson = null;
                try {
                    autopsyJson = await storage.downloadJSON(`incidents/${incidentId}/autopsy.json`);
                } catch (e) { }

                let patchDiff = "";
                try {
                    patchDiff = await storage.downloadText(`incidents/${incidentId}/patch.diff`);
                } catch (e) { }

                // Logs (Optional)
                let preLog = "";
                try {
                    preLog = await storage.downloadText(`incidents/${incidentId}/logs/pre.txt`);
                } catch (e) { }

                const autopsyHtml = autopsyJson ? `
                    <h3>Root Cause</h3>
                    <pre>${JSON.stringify(autopsyJson, null, 2)}</pre>
                ` : "<p>Analysis pending or failed</p>";

                const patchHtml = patchDiff ? `
                    <h3>Suggested Patch</h3>
                    <pre>${patchDiff}</pre>
                ` : "";

                const logsHtml = preLog ? `
                    <h3>Repro Logs (Pre-Fix)</h3>
                    <pre>${preLog}</pre>
                ` : "";

                return new Response(`
                    <h1>Incident: ${incidentId}</h1>
                    <a href="/">Back to List</a>
                    ${autopsyHtml}
                    ${patchHtml}
                    ${logsHtml}
                `, { headers: { "Content-Type": "text/html" } });

            } catch (e) {
                return new Response(`Error loading incident ${incidentId}: ${e}`, { status: 500 });
            }
        }

        return new Response("Not Found", { status: 404 });
    },
});

console.log(`Dashboard listening on http://localhost:${PORT}`);
