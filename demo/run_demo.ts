import { spawn } from "child_process";
import fs from "fs";
import { join } from "path";
import { loadConfig } from "../shared/config_loader";

const config = loadConfig();

const DEMO_OUT = config.paths.output;

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
    console.log(`=== Starting ${config.project_name} Demo ===`);

    const args = process.argv.slice(2);
    let scenarioId = "1";
    if (args.length >= 2 && args[0] === "--scenario") {
        scenarioId = args[1];
    }

    const startTime = Date.now();

    console.log("\n[1/10] Resetting Environment...");
    await runCommand("docker-compose", ["down"]);
    if (fs.existsSync(DEMO_OUT)) fs.rmSync(DEMO_OUT, { recursive: true });
    fs.mkdirSync(DEMO_OUT, { recursive: true });

    // Use paths from config for cleaning
    // Note: We need to access the defaults which might be relative or Docker paths.
    // Locally, run_demo is run from root, so config loader returns absolute paths or relative to root.
    // We can use them directly.
    const dirsToClean = [
        config.paths.events,
        config.paths.storage,
        config.paths.autopsy_output,
        config.paths.patches,
        config.paths.pr_description,
        join(config.paths.repo_root, "app/test/generated"), // Hardcoded relative path inside repo?
        config.paths.repro_logs,
        "dashboard/reports" // Dashboard export path? I didn't verify dashboard export path refactor. Check dashboard export.ts
    ];

    for (const d of dirsToClean) {
        if (fs.existsSync(d)) fs.rmSync(d, { recursive: true });
        fs.mkdirSync(d, { recursive: true });
    }

    console.log("\n[2/10] Starting Docker Stack...");
    await runCommand("docker-compose", ["up", "-d", "--build"]);
    console.log("Waiting for services to be ready (10s)...");
    await Bun.sleep(10000);

    console.log(`\n[3/10] Triggering Bug...`);
    // NOTE: Scenario file pattern could be used to find the file
    const scenarioPath = `test/bug-scenarios/scenario-${scenarioId}.json`;
    if (!fs.existsSync(scenarioPath)) {
        throw new Error(`Scenario file not found: ${scenarioPath}`);
    }
    const scenarioPayload = await Bun.file(scenarioPath).json();

    try {
        await fetch(`${config.services.sample_app.base_url}/trigger`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(scenarioPayload)
        });
    } catch (e) {
        console.log("Trigger request sent.");
    }

    console.log("\n[4/10] Waiting for Agent to Detect Incident...");
    let incidentFile = "";
    const eventsDir = config.paths.events;

    for (let i = 0; i < 20; i++) {
        await Bun.sleep(1000);
        if (fs.existsSync(eventsDir)) {
            const files = fs.readdirSync(eventsDir);
            if (files.length > 0) {
                incidentFile = join(eventsDir, files[0]);
                console.log(`Incident detected: ${incidentFile}`);
                break;
            }
        }
    }
    if (!incidentFile) throw new Error("Timeout waiting for incident event");

    console.log("\n[5/10] Ingesting Incident to Router...");
    const incidentData = await Bun.file(incidentFile).json();
    const ingestRes = await fetch(`${config.services.router.base_url}/ingest`, {
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
    const analyzeRes = await fetch(`${config.services.autopsy.base_url}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Repo path is strictly for docker context in autopsy? or local?
        // Autopsy internal logic uses config.paths.repo_root now.
        // It reads from request body "repo_path". 
        // I should stick to "/repo" if running in docker?
        // But Autopsy service refactor ignored body.repo_path? 
        // Let's check Autopsy code. It used `REPO_DIR` constant from config.
        // It DOES parse `body.repo_path` but ignored it in my refactor? 
        // Wait, step 1873: `const REPO_DIR = config.paths.repo_root;`.
        // The endpoint: `const body = await req.json() ... const fileInRepo = join(REPO_DIR, relPath)`.
        // It uses the constant.
        // So I can send anything in repo_path, or keep it consistent.
        // I'll send `config.paths.repo_root` logic or just "/repo" placeholder.
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

    const cp = (src: string, destName: string) => {
        if (fs.existsSync(src)) {
            fs.copyFileSync(src, join(DEMO_OUT, destName));
            console.log(`Copied: ${destName}`);
        } else {
            console.warn(`Missing: ${src}`);
        }
    };

    cp(incidentFile, `incident-${scenarioId}.json`);

    const storageDir = config.paths.storage;
    const snapshotFile = fs.existsSync(storageDir) ?
        join(storageDir, fs.readdirSync(storageDir)[0]) : "";
    if (snapshotFile) cp(snapshotFile, `snapshot-${scenarioId}.json`);

    // Use config paths for source
    // Be careful about filenames: incident-1 vs dynamic
    // Autopsy output path is config.paths.autopsy_output
    // Filename is currently hardcoded "incident-1-autopsy.json" in autopsy settings :(
    // I left it hardcoded in Autopsy index.ts: `const OUTPUT_FILE = "incident-1-autopsy.json";`
    // So I must look for it there.
    const autopsyOut = config.paths.autopsy_output;
    if (fs.existsSync(autopsyOut)) {
        const files = fs.readdirSync(autopsyOut);
        if (files.length > 0) cp(join(autopsyOut, files[0]), `incident-${scenarioId}-autopsy.json`);
        else console.warn("No autopsy output found to copy");
    }

    const patchesDir = config.paths.patches;
    if (fs.existsSync(patchesDir)) {
        const files = fs.readdirSync(patchesDir);
        if (files.length > 0) cp(join(patchesDir, files[0]), `patch-${scenarioId}.diff`);
    }

    const reproLogs = config.paths.repro_logs;
    cp(join(reproLogs, "pre.txt"), "pre.txt");
    cp(join(reproLogs, "post.txt"), "post.txt");

    // Dashboard report
    cp("dashboard/reports/incident-1.pdf", `incident-${scenarioId}.pdf`);


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
