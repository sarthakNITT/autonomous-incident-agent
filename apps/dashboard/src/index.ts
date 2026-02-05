import { renderIncidentView } from "./views/incident";
import type { AutopsyResult } from "@repo/types";
import { join } from "path";

const PORT = 3000;

console.log(`Starting Dashboard Server on port ${PORT}...`);

const server = Bun.serve({
    port: PORT,
    async fetch(req) {
        const url = new URL(req.url);

        if (url.pathname === "/incident-1") {
            try {
                // Paths adjusted for Docker volume mounts or local relative paths
                const autopsyPath = "/app/autopsy/sample_output/incident-1-autopsy.json";
                const prDescPath = "/app/autopsy/pr_description/incident-1-pr.md";
                const preLogPath = "/app/repro/logs/pre.txt";
                const postLogPath = "/app/repro/logs/post.txt";

                // Fallback for local run
                const prefix = (await Bun.file(autopsyPath).exists()) ? "" : "../../";

                const autopsyFile = Bun.file(join(prefix, autopsyPath.startsWith("/") ? autopsyPath.slice(1) : autopsyPath));
                const prFile = Bun.file(join(prefix, prDescPath.startsWith("/") ? prDescPath.slice(1) : prDescPath));
                const preFile = Bun.file(join(prefix, preLogPath.startsWith("/") ? preLogPath.slice(1) : preLogPath));
                const postFile = Bun.file(join(prefix, postLogPath.startsWith("/") ? postLogPath.slice(1) : postLogPath));

                // Read all data
                const autopsy = await autopsyFile.json() as AutopsyResult;
                const prDesc = await prFile.text();
                const preLogs = await preFile.text();
                const postLogs = await postFile.text();

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
