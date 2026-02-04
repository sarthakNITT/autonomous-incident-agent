import type { IncidentEvent, LogSnapshot } from "@repo/types";
import { join } from "path";

const LOG_FILE_PATH = "/logs/app.log";
const EVENTS_DIR = "/events";
const INCIDENT_FILE = "incident-1.json";

console.log("Starting AIA Agent...");
console.log(`Monitoring ${LOG_FILE_PATH} for failure patterns...`);

const logBuffer: string[] = [];
const BUFFER_SIZE = 50;

async function tailFile(filePath: string) {
    const file = Bun.file(filePath);

    // Initial check if file exists, wait if not
    while (!(await file.exists())) {
        console.log("Waiting for log file to be created...");
        await Bun.sleep(1000);
    }

    const stream = file.stream();
    const reader = stream.getReader();
    const decoder = new TextDecoder();

    let buffer = "";

    try {
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value, { stream: true });
            buffer += chunk;

            const lines = buffer.split("\n");
            // Keep the last part in buffer if it doesn't end with newline
            buffer = lines.pop() || "";

            for (const line of lines) {
                processLine(line);
            }
        }
    } catch (error) {
        console.error("Error reading log stream:", error);
    }
}

function processLine(line: string) {
    if (!line.trim()) return;

    // Add to buffer
    logBuffer.push(line);
    if (logBuffer.length > BUFFER_SIZE) {
        logBuffer.shift();
    }

    // Check for trigger
    if (line.includes("SeededDemoFailure")) {
        console.log("FAILURE DETECTED! Generating incident report...");
        generateIncident(line);
    }
}

async function generateIncident(triggerLine: string) {
    const timestamp = new Date().toISOString();

    // Attempt to extract request_id if present in recent logs
    // Looking for pattern: "request_id": "..."
    let requestId = "unknown";
    const reversedBuffer = [...logBuffer].reverse();
    for (const log of reversedBuffer) {
        const match = log.match(/(?:["']?request_id["']?)\s*[:=]\s*["']([^"']+)["']/);
        if (match) {
            requestId = match[1] || "unknown";
            break;
        }
    }

    const logSnapshots: LogSnapshot[] = logBuffer.map(msg => ({
        timestamp: new Date().toISOString(), // In a real app we'd parse the log timestamp
        level: "info", // inferred
        message: msg
    }));

    const incident: IncidentEvent = {
        id: crypto.randomUUID(),
        timestamp,
        severity: "critical",
        service_name: "sample-app",
        error_details: {
            message: "SeededDemoFailure: deterministic bug for AIA demo",
            stacktrace: triggerLine // Simplified for demo
        },
        log_snapshot: logSnapshots,
        request_id: requestId
    };

    const outputPath = join(EVENTS_DIR, INCIDENT_FILE);
    try {
        await Bun.write(outputPath, JSON.stringify(incident, null, 2));
        console.log(`Incident written to ${outputPath}`);
    } catch (error) {
        console.error(`Failed to write incident file: ${error}`);
    }
}

// Start tailing
// Note: In a real "tail -f" scenario with node/bun, reading stream until end usually stops.
// For this demo, assuming file grows. A robust solution would use fs.watch or polling.
// Using a simple polling tail implementation for simplicity and robustness in this demo environment.

async function pollTail(filePath: string) {
    let fileSize = 0;

    // Wait for file creation
    while (!(await Bun.file(filePath).exists())) {
        console.log(`Waiting for ${filePath}...`);
        await Bun.sleep(1000);
    }

    console.log(`Tailing ${filePath}...`);

    while (true) {
        try {
            const file = Bun.file(filePath);
            const currentSize = file.size;

            if (currentSize > fileSize) {
                const newContent = file.slice(fileSize, currentSize);
                const text = await newContent.text();

                const lines = text.split("\n");
                for (const line of lines) {
                    processLine(line);
                }

                fileSize = currentSize;
            } else if (currentSize < fileSize) {
                // File rotated or truncated
                fileSize = 0;
            }
        } catch (e) {
            console.error("Error polling file:", e);
        }
        await Bun.sleep(500);
    }
}

pollTail(LOG_FILE_PATH);
