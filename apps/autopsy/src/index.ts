import type { RouterSnapshot, AutopsyResult, IncidentEvent } from "@repo/types";
import { loadConfig } from "../../../shared/config_loader";
import { R2Client } from "@repo/storage";
import { AstLocator } from "./ast_locator";
import { YouComReasoner } from "./ai_reasoner";
import { join } from "path";

const config = loadConfig();
const PORT = config.services.autopsy.port;
const REPO_DIR = config.paths.repo_root;

const storage = new R2Client(config.storage);
const locator = new AstLocator(REPO_DIR);
const aiConfig = config.ai || { api_key: "PLACEHOLDER", model: "mock", provider: "mock" };
const reasoner = new YouComReasoner(aiConfig.api_key, aiConfig.model);

const server = Bun.serve({
    port: PORT,
    async fetch(req) {
        const url = new URL(req.url);

        if (req.method === "POST" && url.pathname === "/analyze") {
            try {
                const body = await req.json() as any;
                const snapshotKey = body.snapshot_key;

                if (!snapshotKey) {
                    return new Response("Missing snapshot_key", { status: 400 });
                }

                console.log(`[Autopsy] Analysis Request: ${snapshotKey}`);

                const snapshot = await storage.downloadJSON<RouterSnapshot>(snapshotKey);
                const incidentId = snapshot.event.id;
                const stacktrace = snapshot.event.stacktrace || "";

                console.log(`[Autopsy] Snapshot Loaded. Incident: ${incidentId}`);

                const locations = await locator.locateSource(stacktrace);
                const fileContext = [];
                for (const loc of locations) {
                    console.log(`[Autopsy] Located source: ${loc.relPath}:${loc.line}`);
                    const content = await locator.readContext(loc.path, loc.line);
                    fileContext.push({
                        path: loc.relPath,
                        content: content,
                        line_range: `${loc.line - 5}-${loc.line + 5}`
                    });
                }

                if (fileContext.length === 0) {
                    console.warn("[Autopsy] Could not locate source files from stacktrace.");
                }

                const request = {
                    stacktrace: stacktrace,
                    file_context: fileContext,
                    error_message: snapshot.event.error_details?.message || "Unknown error"
                };

                const aiResponse = await reasoner.analyze(request);

                const result: AutopsyResult = {
                    root_cause_text: aiResponse.root_cause,
                    confidence: aiResponse.confidence,
                    suggested_patch: {
                        file_path: aiResponse.patch.file_path,
                        language: "typescript",
                        patch_diff: aiResponse.patch.diff
                    },
                    file_path: aiResponse.patch.file_path,
                    line_range: "0-0",
                    commit_hash: snapshot.repo_git_ref.commit || "unknown"
                };

                const resultKey = `incidents/${incidentId}/autopsy.json`;
                const patchKey = `incidents/${incidentId}/patch.diff`;

                await storage.uploadJSON(resultKey, result);
                await storage.uploadText(patchKey, result.suggested_patch.patch_diff);

                console.log(`[Autopsy] Completed. Result: ${resultKey}`);

                const gitServiceUrl = `${config.services.git.base_url}/pr`;
                try {
                    const prReq = {
                        incident_id: incidentId,
                        title: `Fix: ${result.root_cause_text.substring(0, 50)}`,
                        body: `## Root Cause\n${result.root_cause_text}\n\n## Fix\nApplied patch automatically.`,
                        patches: [{ path: "patch.diff", content: result.suggested_patch.patch_diff }],
                        files: []
                    };

                    fetch(gitServiceUrl, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(prReq)
                    }).catch(err => console.error("Failed to trigger Git service async", err));
                } catch (e) {
                    console.error("Failed to prepare PR request", e);
                }

                return new Response(JSON.stringify({
                    status: "analyzed",
                    result_key: resultKey,
                    patch_key: patchKey
                }), {
                    headers: { "Content-Type": "application/json" }
                });

            } catch (e) {
                console.error("Analysis failed", e);
                return new Response(`Internal Server Error: ${e}`, { status: 500 });
            }
        }

        return new Response("Not Found", { status: 404 });
    },
});

console.log(`Autopsy AI Service listening on http://localhost:${PORT}`);
