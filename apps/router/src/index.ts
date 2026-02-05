import type { IncidentEvent, RouterSnapshot, EnvMetadata, RepoRef } from "@repo/types";
import { join } from "path";

const PORT = process.env.PORT || 4000;
// Use absolute path in Docker, relative in local dev
const STORAGE_DIR = process.env.BUN_ENV === "docker" ? "/storage" : join(process.cwd(), "../../router/storage");

const server = Bun.serve({
    port: PORT,
    async fetch(req) {
        const url = new URL(req.url);

        if (req.method === "POST" && url.pathname === "/ingest") {
            try {
                const event: IncidentEvent = await req.json();

                const snapshotId = crypto.randomUUID();
                const receivedAt = new Date().toISOString();

                const envMetadata: EnvMetadata = {
                    service_name: event.service_name || "unknown",
                    env: event.environment?.env || "unknown",
                    version: event.environment?.version || "unknown",
                    received_at: receivedAt
                };

                const repoRef: RepoRef = {
                    repo_url: "local-sample-repo",
                    commit: "demo-seeded",
                    branch: "main"
                };

                const snapshot: RouterSnapshot = {
                    snapshot_id: snapshotId,
                    event: event,
                    env_metadata: envMetadata,
                    repo_git_ref: repoRef
                };

                const filename = `snapshot-${snapshotId}.json`;
                const filePath = join(STORAGE_DIR, filename);

                await Bun.write(filePath, JSON.stringify(snapshot, null, 2));
                console.log(`Snapshot saved to ${filePath}`);

                return new Response(JSON.stringify({ snapshot_id: snapshotId }), {
                    headers: { "Content-Type": "application/json" }
                });

            } catch (error) {
                console.error("Error processing ingest:", error);
                return new Response(JSON.stringify({ error: "Failed to process request" }), {
                    status: 500,
                    headers: { "Content-Type": "application/json" }
                });
            }
        }

        if (url.pathname === "/health") {
            return new Response(JSON.stringify({ status: "ok" }), {
                headers: { "Content-Type": "application/json" }
            });
        }

        return new Response("Not Found", { status: 404 });
    }
});

console.log(`Router service listening on port ${PORT}`);
