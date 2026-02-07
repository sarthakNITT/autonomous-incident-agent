import { loadConfig } from "../../../shared/config_loader";
import { validateIncident } from "./orchestrator";

const config = loadConfig();
const PORT = config.services.repro.port;

const server = Bun.serve({
    port: PORT,
    async fetch(req) {
        const url = new URL(req.url);

        if (req.method === "POST" && url.pathname.startsWith("/validate")) {
            try {
                const body = await req.json();
                const { incident_id, commit_hash, repo_path } = body;

                // Run async, don't block
                validateIncident(incident_id, commit_hash, repo_path).catch(console.error);

                return new Response("Validation Triggered", { status: 202 });
            } catch (e) {
                return new Response("Bad Request", { status: 400 });
            }
        }

        return new Response("Repro Service Running", { status: 200 });
    }
});

console.log(`Repro Service listening on http://localhost:${PORT}`);
