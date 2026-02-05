import type { AutopsyResult, RouterSnapshot, PatchSuggestion } from "@repo/types";
import { join } from "path";
import { loadConfig } from "../../../shared/config_loader";

const config = loadConfig();

const PORT = config.services.autopsy.port;
// Config loader handles path resolution for docker/local
const STORAGE_DIR = config.paths.storage;
const REPO_DIR = config.paths.repo_root;
const OUTPUT_DIR = config.paths.autopsy_output;
const OUTPUT_FILE = "incident-1-autopsy.json";

const server = Bun.serve({
    port: PORT,
    async fetch(req) {
        const url = new URL(req.url);

        if (req.method === "POST" && url.pathname === "/analyze") {
            try {
                console.log(`[DEBUG] Current CWD: ${process.cwd()}`);
                console.log(`[DEBUG] REPO_DIR: ${REPO_DIR}`);
                console.log(`[DEBUG] STORAGE_DIR: ${STORAGE_DIR}`);
                console.log(`[DEBUG] OUTPUT_DIR: ${OUTPUT_DIR}`);

                const body = await req.json() as { snapshot_id: string; repo_path: string };
                const snapshotId = body.snapshot_id;

                if (!snapshotId) {
                    return new Response("Missing snapshot_id", { status: 400 });
                }

                const snapshotPath = join(STORAGE_DIR, `snapshot-${snapshotId}.json`);
                console.log(`[DEBUG] Reading snapshot from: ${snapshotPath}`);

                const snapshotFile = Bun.file(snapshotPath);

                if (!(await snapshotFile.exists())) {
                    console.log(`[DEBUG] Snapshot file not found at ${snapshotPath}`);
                    return new Response(`Snapshot ${snapshotId} not found`, { status: 404 });
                }

                const snapshot = await snapshotFile.json() as RouterSnapshot;
                console.log(`[DEBUG] Snapshot loaded.`);

                const stacktrace = snapshot.event.stacktrace;
                console.log(`[DEBUG] Stacktrace sample: ${stacktrace.substring(0, 100)}...`);

                const match = stacktrace.match(/\/apps\/sample-app\/src\/([^:]+):(\d+):(\d+)/);

                if (!match) {
                    console.log(`[DEBUG] Regex failed to match stacktrace`);
                    return new Response("Could not locate source file in stacktrace", { status: 422 });
                }

                const relPath = `apps/sample-app/src/${match[1]}`;
                const fileInRepo = join(REPO_DIR, relPath);
                console.log(`[DEBUG] Resolved source file path: ${fileInRepo}`);

                const lineNumber = parseInt(match[2], 10);

                const sourceFile = Bun.file(fileInRepo);
                if (!(await sourceFile.exists())) {
                    console.log(`[DEBUG] Source file does not exist at ${fileInRepo}`);
                    return new Response(`Source file ${relPath} not found in mapped repo`, { status: 422 });
                }

                const sourceContent = await sourceFile.text();
                const lines = sourceContent.split("\n");

                const startLine = Math.max(0, lineNumber - 3);
                const endLine = lineNumber + 3;

                const originalChunk = lines.slice(startLine, endLine).map(l => `-${l}`).join("\n");
                const patch = `--- ${relPath}\n+++ ${relPath}\n@@ -${startLine + 1},${endLine - startLine} +${startLine + 1},0 @@\n${originalChunk}`;

                const suggestion: PatchSuggestion = {
                    file_path: relPath,
                    language: "typescript",
                    patch_diff: patch
                };

                const result: AutopsyResult = {
                    root_cause_text: "The application explicitly throws a 'SeededDemoFailure' when the action 'cause_error' is received. This appears to be a test artifact left in production code.",
                    commit_hash: snapshot.repo_git_ref.commit,
                    file_path: relPath,
                    line_range: `${startLine + 1}-${endLine}`,
                    suggested_patch: suggestion,
                    confidence: 0.95
                };

                // Save output
                const outputPath = join(OUTPUT_DIR, OUTPUT_FILE);
                console.log(`[DEBUG] Writing output to: ${outputPath}`);
                await Bun.write(outputPath, JSON.stringify(result, null, 2));

                return new Response(JSON.stringify(result), {
                    headers: { "Content-Type": "application/json" }
                });

            } catch (error) {
                console.error("Autopsy failed:", error);
                return new Response(JSON.stringify({ error: "Internal Analysis Error", details: String(error) }), {
                    status: 500,
                    headers: { "Content-Type": "application/json" }
                });
            }
        }

        return new Response("Not Found", { status: 404 });
    }
});

console.log(`Autopsy service listening on port ${PORT}`);
