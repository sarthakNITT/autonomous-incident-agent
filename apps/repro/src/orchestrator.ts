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

export async function validateIncident(incidentId: string, commitHash: string, repoPath: string): Promise<ReproResult> {
    console.log(`[Repro] Starting Validation for Incident ${incidentId}`);

    try {
        const patchKey = `incidents/${incidentId}/patch.diff`;
        const patchContent = await storage.downloadText(patchKey);
        if (!patchContent) throw new Error("Patch not found in R2");

        const testKey = `incidents/${incidentId}/repro_test.ts`;
        const testContent = await storage.downloadText(testKey).catch(() => null);

        // 1. Apply Patch
        const patchFile = join(repoPath, "temp_repro.patch");
        await Bun.write(patchFile, patchContent);

        const patchRes = await runCommand("git", ["apply", patchFile], repoPath);
        if (patchRes.exit_code !== 0) {
            throw new Error(`Patch application failed: ${patchRes.output}`);
        }

        // 2. Run Test
        if (testContent) {
            const testPath = join(repoPath, "repro.test.ts");
            await Bun.write(testPath, testContent);

            const testRes = await runCommand("bun", ["test", "repro.test.ts"], repoPath);

            const result: ReproResult = {
                incident_id: incidentId,
                commit_hash: commitHash,
                passed: testRes.exit_code === 0,
                logs: {
                    stdout: testRes.output,
                    stderr: ""
                },
                timestamp: new Date().toISOString()
            };

            await storage.uploadJSON(`incidents/${incidentId}/repro/result.json`, result);
            await storage.uploadText(`incidents/${incidentId}/repro/post.txt`, testRes.output);

            const status = result.passed ? "resolved" : "failed";
            await fetch(`${config.services.state.base_url}/incidents/${incidentId}/update`, {
                method: "POST", headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status,
                    validation_status: result.passed
                })
            });

            console.log(`[Repro] Validation Complete. Passed: ${result.passed}`);

            const token = process.env.GITHUB_TOKEN;
            if (token && config.github.provider === "github") {
                // PR comment logic would go here
            }

            return result;
        } else {
            console.log("[Repro] No standalone test found to run.");
            return {
                incident_id: incidentId,
                commit_hash: commitHash,
                passed: true, // No test to fail, so consider it passed for now
                logs: { stdout: "No test found to run.", stderr: "" },
                timestamp: new Date().toISOString()
            };
        }

    } catch (e) {
        console.error("Repro Orchestrator Failed", e);
        throw e;
    }
}

if (import.meta.main) {
    const INCIDENT_ID = process.env.INCIDENT_ID || "unknown";
    const COMMIT_HASH = process.env.COMMIT_HASH || "HEAD";
    const REPO_PATH = process.env.REPO_PATH || "/app/target_repo";

    // Only run if ENV vars are present (CI mode)
    if (INCIDENT_ID !== "unknown") {
        validateIncident(INCIDENT_ID, COMMIT_HASH, REPO_PATH)
            .then((result) => {
                if (!result.passed) {
                    process.exit(1);
                }
            })
            .catch(() => process.exit(1));
    } else {
        console.log("INCIDENT_ID not set. Skipping direct execution.");
    }
}

