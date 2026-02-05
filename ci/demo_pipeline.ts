import { spawn } from "child_process";

console.log("Starting CI Demo Pipeline...");

const demo = spawn("bun", ["run", "demo/run_demo.ts"], { stdio: "inherit" });

demo.on("close", (code) => {
    if (code !== 0) {
        console.error("Pipeline failed.");
        process.exit(code ?? 1);
    } else {
        console.log("Pipeline success.");
        process.exit(0);
    }
});
