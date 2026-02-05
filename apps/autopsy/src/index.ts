import type { RouterSnapshot, AutopsyResult } from "@repo/types";
import { join } from "path";
import { loadConfig } from "../../../shared/config_loader";
import { R2Client } from "@repo/storage";

const config = loadConfig();
const PORT = config.services.autopsy.port;
// REPO_DIR kept for when we implement real analysis, but unused in this mock
const REPO_DIR = config.paths.repo_root;

// R2 Client
const storage = new R2Client(config.storage);

const server = Bun.serve({
    port: PORT,
    async fetch(req) {
        const url = new URL(req.url);

        if (req.method === "POST" && url.pathname === "/analyze") {
            try {
                const body = await req.json() as any;
                // Expect snapshot_key from caller (Router response)
                const snapshotKey = body.snapshot_key;

                if (!snapshotKey) {
                    return new Response("Missing snapshot_key", { status: 400 });
                }

                console.log(`[Autopsy] Analyzing snapshot from key: ${snapshotKey}`);

                // 1. Download Snapshot from R2
                const snapshot = await storage.downloadJSON<RouterSnapshot>(snapshotKey);
                // incident_id is available in snapshot? Check types.
                // In previous step Router sent:
                // snapshot_id, event, env_metadata, repo_git_ref.
                // Incident ID is inside event.id.
                const incidentId = snapshot.event.id;

                // 2. Mock Analysis
                const rootCause = "Found deterministic failure in sample-app/src/index.ts handling 'cause_crash' action.";
                const patchDiff = `--- apps/sample-app/src/index.ts
+++ apps/sample-app/src/index.ts
@@ -50,7 +50,7 @@
         // Vulnerability: No input validation
         if (payload.action === "cause_crash") {
-            process.exit(1);
+            // Fixed: process.exit(1);
+            console.log("Crash averted");
         }`;

                const result: AutopsyResult = {
                    // analysis_id and snapshot_id are not in AutopsyResult type
                    root_cause_text: rootCause,
                    confidence: 0.95,
                    suggested_patch: {
                        file_path: "apps/sample-app/src/index.ts",
                        language: "typescript",
                        patch_diff: patchDiff
                    },
                    file_path: "apps/sample-app/src/index.ts",
                    line_range: "50-55",
                    commit_hash: snapshot.repo_git_ref.commit || "unknown" // Mock property if available in snapshot, or hardcode
                };

                // 3. Upload Result to R2
                const resultKey = `incidents/${incidentId}/autopsy.json`;
                const patchKey = `incidents/${incidentId}/patch.diff`;

                await storage.uploadJSON(resultKey, result);
                await storage.uploadText(patchKey, patchDiff);

                console.log(`[Autopsy] Analysis uploaded to ${resultKey}`);

                return new Response(JSON.stringify({
                    status: "analyzed",
                    result_key: resultKey,
                    patch_key: patchKey
                }), {
                    headers: { "Content-Type": "application/json" }
                });

            } catch (e) {
                console.error("Analysis failed", e);
                return new Response("Internal Server Error", { status: 500 });
            }
        }

        return new Response("Not Found", { status: 404 });
    },
});

console.log(`Autopsy listening on http://localhost:${PORT}`);
