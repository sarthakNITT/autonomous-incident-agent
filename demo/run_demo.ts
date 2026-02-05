import { spawn } from "child_process";
import fs from "fs";
import { join } from "path";

const DEMO_OUT = "demo/output";

async function runCommand(command: string, args: string[], cwd: string = "."): Promise<void> {
    console.log(`> ${command} ${args.join(" ")}`);
    const proc = spawn(command, args, { cwd, stdio: "inherit" });
    await new Promise<void>((resolve, reject) => {
        proc.on("close", (code) => {
            if (code === 0) resolve();
            else reject(new Error(`Command failed with code ${code}`));
        });
    });
}

async function runCommandWithOutput(command: string, args: string[], cwd: string = "."): Promise<string> {
    return new Promise((resolve, reject) => {
        const proc = spawn(command, args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
        let stdout = "";
        proc.stdout.on("data", (d) => stdout += d.toString());
        proc.on("close", (code) => {
            if (code === 0) resolve(stdout.trim());
            else reject(new Error(`Command failed with code ${code}`));
        });
    });
}

async function main() {
    console.log("=== Starting Autonomous Incident Agent Demo ===");
    const startTime = Date.now();

    // 1. Reset
    console.log("\n[1/10] Resetting Environment...");
    await runCommand("docker-compose", ["down"]);
    if (fs.existsSync(DEMO_OUT)) fs.rmSync(DEMO_OUT, { recursive: true });
    fs.mkdirSync(DEMO_OUT, { recursive: true });

    // Cleanup internal artifact dirs
    const dirsToClean = ["events", "router/storage", "autopsy/sample_output", "autopsy/patches", "autopsy/pr_description", "app/test/generated", "repro/logs", "dashboard/reports"];
    for (const d of dirsToClean) {
        if (fs.existsSync(d)) fs.rmSync(d, { recursive: true });
        fs.mkdirSync(d, { recursive: true });
    }

    // 2. Start Stack
    console.log("\n[2/10] Starting Docker Stack...");
    await runCommand("docker-compose", ["up", "-d", "--build"]);
    console.log("Waiting for services to be ready (10s)...");
    await Bun.sleep(10000);

    console.log("\n[3/10] Triggering Bug in Sample App...");
    try {
        await fetch("http://localhost:3000/trigger", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                request_id: "demo-req-1",
                payload: { action: "cause_error" }
            })
        });
    } catch (e) {
        console.log("Trigger request sent.");
    }

    console.log("\n[4/10] Waiting for Agent to Detect Incident...");
    let incidentFile = "";
    for (let i = 0; i < 20; i++) {
        await Bun.sleep(1000);
        const files = fs.readdirSync("events");
        if (files.length > 0) {
            incidentFile = join("events", files[0]);
            console.log(`Incident detected: ${incidentFile}`);
            break;
        }
    }
    if (!incidentFile) throw new Error("Timeout waiting for incident event");

    console.log("\n[5/10] Ingesting Incident to Router...");
    const incidentData = await Bun.file(incidentFile).json();
    const ingestRes = await fetch("http://localhost:4000/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(incidentData)
    });
    if (!ingestRes.ok) throw new Error("Ingest failed");
    const ingestJson = await ingestRes.json() as any;
    const snapshotId = ingestJson.snapshot_id;
    console.log(`Snapshot Created: ${snapshotId}`);

    await Bun.sleep(1000);

    console.log("\n[6/10] Analyzing Root Cause via Autopsy...");
    const analyzeRes = await fetch("http://localhost:5001/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ snapshot_id: snapshotId, repo_path: "/repo" })
    });
    if (!analyzeRes.ok) throw new Error("Analysis failed");
    console.log("Analysis Complete.");

    console.log("\n[7/10] Generating PR Artifacts...");
    await runCommand("bun", ["run", "apps/autopsy/pr_generator.ts"]);

    console.log("\n[8/10] Verifying Fix with Repro Harness...");
    await runCommand("bun", ["run", "repro/run_repro.ts"]);

    console.log("\n[9/10] Exporting Dashboard PDF...");
    await runCommand("bun", ["run", "apps/dashboard/src/export.ts"]);

    console.log("\n[10/10] Collecting Demo Artifacts...");

    // Copy function
    const cp = (src: string, destName: string) => {
        if (fs.existsSync(src)) {
            fs.copyFileSync(src, join(DEMO_OUT, destName));
            console.log(`Copied: ${destName}`);
        } else {
            console.warn(`Missing: ${src}`);
        }
    };

    cp(incidentFile, "incident-1.json");

    const snapshotFile = fs.existsSync("router/storage") ?
        join("router/storage", fs.readdirSync("router/storage")[0]) : "";
    if (snapshotFile) cp(snapshotFile, "snapshot-1.json");

    cp("autopsy/sample_output/incident-1-autopsy.json", "incident-1-autopsy.json");
    cp("autopsy/patches/patch-1.diff", "patch-1.diff");
    cp("repro/logs/pre.txt", "pre.txt");
    cp("repro/logs/post.txt", "post.txt");
    cp("dashboard/reports/incident-1.pdf", "incident-1.pdf");

    // Cleanup
    console.log("\nCleaning up...");
    await runCommand("docker-compose", ["down"]);

    const duration = (Date.now() - startTime) / 1000;
    console.log(`\n=== Demo Pipeline Complete in ${duration.toFixed(1)}s ===`);
    console.log(`Artifacts available in ${DEMO_OUT}`);
}

main().catch(err => {
    console.error("\n❌ Demo Failed:", err);
    process.exit(1);
});
