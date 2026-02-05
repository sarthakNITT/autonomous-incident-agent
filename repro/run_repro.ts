import { spawn } from "child_process";
import { join } from "path";

const REPRO_DIR = "repro";
const LOGS_DIR = join(REPRO_DIR, "logs");
const PRE_LOG = join(LOGS_DIR, "pre.txt");
const POST_LOG = join(LOGS_DIR, "post.txt");
const PATCH_FILE = "autopsy/patches/patch-1.diff";

async function runCommand(command: string, args: string[], cwd: string = "."): Promise<string> {
    return new Promise((resolve, reject) => {
        const proc = spawn(command, args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
        let stdout = "";
        let stderr = "";

        proc.stdout.on("data", (data) => stdout += data.toString());
        proc.stderr.on("data", (data) => stderr += data.toString());

        proc.on("close", (code) => {
            if (code !== 0) {
                if (stderr) console.error(stderr);
            }
            resolve(stdout + stderr);
        });

        proc.on("error", (err) => reject(err));
    });
}

async function main() {
    console.log("Starting Reproduction Harness...");

    console.log("Resetting repo state...");

    console.log("Running Pre-Patch Test...");
    await runCommand("docker-compose", ["-f", "repro/docker-compose.yml", "build"]);

    await runCommand("docker-compose", ["-f", "repro/docker-compose.yml", "up", "-d", "sample-app"]);

    await Bun.sleep(2000);

    const preOutput = await runCommand("docker-compose", ["-f", "repro/docker-compose.yml", "run", "--rm", "test-runner"]);
    await Bun.write(PRE_LOG, preOutput);
    console.log(`Pre-patch logs written to ${PRE_LOG}`);

    await runCommand("docker-compose", ["-f", "repro/docker-compose.yml", "down"]);

    console.log("Applying Patch...");
    const patchCmd = `patch -p0 < ${PATCH_FILE}`;
    const process = Bun.spawn(["sh", "-c", patchCmd]);
    await process.exited;

    if (process.exitCode !== 0) {
        console.error("Failed to apply patch");
        return;
    }
    console.log("Patch applied.");

    console.log("Running Post-Patch Test...");
    await runCommand("docker-compose", ["-f", "repro/docker-compose.yml", "build", "sample-app"]);

    await runCommand("docker-compose", ["-f", "repro/docker-compose.yml", "up", "-d", "sample-app"]);

    await Bun.sleep(2000);

    const postOutput = await runCommand("docker-compose", ["-f", "repro/docker-compose.yml", "run", "--rm", "test-runner"]);
    await Bun.write(POST_LOG, postOutput);
    console.log(`Post-patch logs written to ${POST_LOG}`);

    await runCommand("docker-compose", ["-f", "repro/docker-compose.yml", "down"]);

    console.log("Cleaning up workspace...");

    console.log("Reproduction Harness Complete.");
}

main();
