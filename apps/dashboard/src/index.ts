import { renderIncidentView } from "./views/incident";
import type { AutopsyResult } from "@repo/types";
import { join } from "path";
import { loadConfig } from "../../../shared/config_loader";

const config = loadConfig();
const PORT = config.services.dashboard.port;

console.log(`Starting Dashboard Server on port ${PORT}...`);

const server = Bun.serve({
    port: PORT,
    async fetch(req) {
        const url = new URL(req.url);

        // Dynamic route matching /incident-XYZ
        // We assume the URL *is* the ID or contains it. 
        // e.g. /incident-1 -> ID=1? Or ID=incident-1?
        // Existing logic used "incident-1" as part of filename "incident-1-autopsy.json".
        // Let's treat the pathname segment as the slug.

        const pathParts = url.pathname.split("/");
        // pathParts[0] is "", [1] is "incident-1"
        const potentialId = pathParts[1];

        if (potentialId && potentialId.startsWith("incident-")) {
            const incidentId = potentialId; // e.g. "incident-1"

            try {
                // Config handles Docker/Local path resolution
                const autopsyPath = join(config.paths.autopsy_output, `${incidentId}-autopsy.json`);
                const prDescPath = join(config.paths.pr_description, `${incidentId}-pr.md`);
                const preLogPath = join(config.paths.repro_logs, "pre.txt"); // These seem singular in repro harness?
                const postLogPath = join(config.paths.repro_logs, "post.txt");

                console.log(`[DEBUG] Dashboard resolving paths for ${incidentId}:`);
                const autopsyFile = Bun.file(autopsyPath);
                const prFile = Bun.file(prDescPath);
                const preFile = Bun.file(preLogPath);
                const postFile = Bun.file(postLogPath);

                console.log(`[DEBUG] Autopsy: ${autopsyFile.name}`);

                // Read all data
                if (!(await autopsyFile.exists())) {
                    return new Response("Incident Not Found (Autopsy artifact missing)", { status: 404 });
                }

                const autopsy = await autopsyFile.json() as AutopsyResult;
                const prDesc = await prFile.exists() ? await prFile.text() : "PR Description not found.";
                const preLogs = await preFile.exists() ? await preFile.text() : "Pre-patch logs not found.";
                const postLogs = await postFile.exists() ? await postFile.text() : "Post-patch logs not found.";

                const html = renderIncidentView(autopsy, prDesc, preLogs, postLogs);

                return new Response(html, {
                    headers: { "Content-Type": "text/html" }
                });

            } catch (error) {
                console.error("Error serving dashboard:", error);
                return new Response("<h1>500 Internal Error</h1><p>Ensure all artifacts (autopsy, logs) are generated.</p>", {
                    status: 500,
                    headers: { "Content-Type": "text/html" }
                });
            }
        }

        return new Response("Not Found. Try /incident-1", { status: 404 });
    }
});
