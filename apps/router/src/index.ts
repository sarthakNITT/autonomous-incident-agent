import type { IncidentEvent, RouterSnapshot, EnvMetadata, RepoRef } from "@repo/types";
import { join } from "path";
import { loadConfig } from "../../../shared/config_loader";
import { R2Client } from "@repo/storage";

const config = loadConfig();
const PORT = config.services.router.port;


const storage = new R2Client(config.storage);

const server = Bun.serve({
    port: PORT,
    async fetch(req) {
        const url = new URL(req.url);

        if (req.method === "POST" && url.pathname === "/ingest") {
            try {
                const event = await req.json() as IncidentEvent;
                console.log(`[Router] Received incident: ${event.id}`);

                const meta: EnvMetadata = {
                    service_name: event.service_name || "unknown",
                    env: event.environment?.env || "unknown",
                    version: event.environment?.version || "unknown",
                    received_at: new Date().toISOString()
                };

                const repoRef: RepoRef = {
                    repo_url: "local-sample-repo",
                    commit: "demo-seeded",
                    branch: "main"
                };

                const snapshot: RouterSnapshot = {
                    snapshot_id: crypto.randomUUID(),
                    event: event,
                    env_metadata: meta,
                    repo_git_ref: repoRef
                };

                const key = `incidents/${event.id}/snapshot.json`;
                const eventKey = `incidents/${event.id}/event.json`;

                await storage.uploadJSON(eventKey, event);
                await storage.uploadJSON(key, snapshot);

                console.log(`[Router] Snapshot uploaded to R2: ${key}`);

                return new Response(JSON.stringify({ status: "ingested", snapshot_id: snapshot.snapshot_id, key: key }), {
                    headers: { "Content-Type": "application/json" }
                });
            } catch (e) {
                console.error("Ingest failed", e);
                return new Response("Internal Server Error", { status: 500 });
            }
        }

        return new Response("Not Found", { status: 404 });
    },
});

console.log(`Router listening on http://localhost:${PORT}`);
