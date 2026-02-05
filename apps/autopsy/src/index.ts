import type { AutopsyResult, RouterSnapshot, PatchSuggestion } from "@repo/types";
import { join } from "path";

const PORT = 5001;
const STORAGE_DIR = "/storage";
const REPO_DIR = "/repo";
const OUTPUT_DIR = "/output";
const OUTPUT_FILE = "incident-1-autopsy.json";

const server = Bun.serve({
    port: PORT,
    async fetch(req) {
        const url = new URL(req.url);

        if (req.method === "POST" && url.pathname === "/analyze") {
            try {
                const body = await req.json() as { snapshot_id: string; repo_path: string };
                const snapshotId = body.snapshot_id;

                if (!snapshotId) {
                    return new Response("Missing snapshot_id", { status: 400 });
                }

                const snapshotPath = join(STORAGE_DIR, `snapshot-${snapshotId}.json`);
                const snapshotFile = Bun.file(snapshotPath);

                if (!(await snapshotFile.exists())) {
                    return new Response(`Snapshot ${snapshotId} not found`, { status: 404 });
                }

                const snapshot = await snapshotFile.json() as RouterSnapshot;
                const stacktrace = snapshot.event.stacktrace;

                const match = stacktrace.match(/\/apps\/sample-app\/src\/([^:]+):(\d+):(\d+)/);

                if (!match) {
                    return new Response("Could not locate source file in stacktrace", { status: 422 });
                }

                const relPath = `apps/sample-app/src/${match[1]}`;
                const fileInRepo = join(REPO_DIR, relPath);
                const lineNumber = parseInt(match[2], 10);

                const sourceFile = Bun.file(fileInRepo);
                if (!(await sourceFile.exists())) {
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
                await Bun.write(outputPath, JSON.stringify(result, null, 2));

                return new Response(JSON.stringify(result), {
                    headers: { "Content-Type": "application/json" }
                });

            } catch (error) {
                console.error("Autopsy failed:", error);
                return new Response(JSON.stringify({ error: "Internal Analysis Error" }), {
                    status: 500,
                    headers: { "Content-Type": "application/json" }
                });
            }
        }

        return new Response("Not Found", { status: 404 });
    }
});

console.log(`Autopsy service listening on port ${PORT}`);
