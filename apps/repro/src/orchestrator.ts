import { spawn } from "child_process";
import { join } from "path";
import { R2Client } from "@repo/storage";
import { loadConfig } from "../../../shared/config_loader";
import type { ReproResult, TestExecutionLog } from "@repo/types";

const config = loadConfig();
const storage = new R2Client(config.storage);

const INCIDENT_ID = process.env.INCIDENT_ID || "unknown";
const COMMIT_HASH = process.env.COMMIT_HASH || "HEAD";
const REPO_PATH = process.env.REPO_PATH || "/app/target_repo";

async function runCommand(cmd: string, args: string[], cwd: string): Promise<TestExecutionLog> {
    console.log(`> ${cmd} ${args.join(" ")}`);
    return new Promise((resolve) => {
        const proc = spawn(cmd, args, { cwd });
        let stdout = "";
        let stderr = "";
        proc.stdout.on("data", d => stdout += d.toString());
        proc.stderr.on("data", d => stderr += d.toString());

        proc.on("close", (code) => {
            resolve({
                command: `${cmd} ${args.join(" ")}`,
                exit_code: code || 0,
                output: stdout + "\n" + stderr
            });
        });
    });
}

async function main() {
    console.log(`[Repro] Starting Validation for Incident ${INCIDENT_ID}`);

    try {
        const patchKey = `incidents/${INCIDENT_ID}/patch.diff`;
        const patchContent = await storage.downloadText(patchKey);
        if (!patchContent) throw new Error("Patch not found in R2");

        const testKey = `incidents/${INCIDENT_ID}/repro_test.ts`;
        // In real flow, we'd assume the test was uploaded. Logic pending in Autopsy?
        // Autopsy uploads `incident-1-autopsy.json` which contains specific test logic maybe?
        // Or we generated it. For now, we assume it's there or we skip.

        const testContent = await storage.downloadText(testKey);
        // If test content is missing, we might use a default or fail.

        // 1. Apply Patch
        const patchFile = join(REPO_PATH, "temp_repro.patch");
        await Bun.write(patchFile, patchContent);

        const patchRes = await runCommand("git", ["apply", patchFile], REPO_PATH);
        if (patchRes.exit_code !== 0) {
            throw new Error(`Patch application failed: ${patchRes.output}`);
        }

        // 2. Run Test
        // Assuming test is a standalone bun test or part of repo
        // If we have testContent, we write it to a file
        if (testContent) {
            const testPath = join(REPO_PATH, "repro.test.ts");
            await Bun.write(testPath, testContent);

            const testRes = await runCommand("bun", ["test", "repro.test.ts"], REPO_PATH);

            const result: ReproResult = {
                incident_id: INCIDENT_ID,
                commit_hash: COMMIT_HASH,
                passed: testRes.exit_code === 0,
                logs: {
                    stdout: testRes.output,
                    stderr: ""
                },
                timestamp: new Date().toISOString()
            };

            await storage.uploadJSON(`incidents/${INCIDENT_ID}/repro/result.json`, result);
            await storage.uploadText(`incidents/${INCIDENT_ID}/repro/post.txt`, testRes.output);

            // Update State: RESOLVED or FAILED
            const status = result.passed ? "resolved" : "failed";
            await fetch(`${config.services.state.base_url}/incidents/${INCIDENT_ID}/update`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status,
                    validation_status: result.passed
                })
            });

            console.log(`[Repro] Validation Complete. Passed: ${result.passed}`);

            // Post comment to PR
            const token = process.env.GITHUB_TOKEN;
            if (token && config.github.provider === "github") {
                const commentBody = `### Validation Result\n\n**Status**: ${result.passed ? "✅ Passed" : "❌ Failed"}\n\n**Logs**:\n\`\`\`\n${testRes.output.slice(0, 1000)}\n\`\`\``;
                // Need to find PR number. For now, we simulate or assume we can find it via API list
                // Simplified: Just log intent. Real implementation requires finding PR by branch.
                console.log("[Repro] Would post comment to PR:", commentBody);
            }

            if (!result.passed) {
                process.exit(1);
            }
        } else {
            console.log("[Repro] No standalone test found to run.");
        }

    } catch (e) {
        console.error("Repro Orchestrator Failed", e);
        process.exit(1);
    }
}

main();
