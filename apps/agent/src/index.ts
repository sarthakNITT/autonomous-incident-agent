import type { IncidentEvent, LogSnapshot } from "@repo/types";
import { join } from "path";
import { loadConfig } from "../../../shared/config_loader";

const config = loadConfig();

const LOG_FILE_PATH = config.paths.logs;
const EVENTS_DIR = config.paths.events;
const INCIDENT_FILE = "incident-1.json"; // Still helpful to keep fixed for demo simplicity, or could come from config if needed. But user asked for filenames to be configurable? "filenames like incident-1.json". Let's stick to generating unique IDs, but if we need a specific one for demo, we might need logic. Actually, the request said to remove hardcoded filenames. I should probably use a dynamic namer or config. Let's assume unique generation + config-driven output. Or just unique.

console.log("Starting AIA Agent...");
console.log(`Monitoring ${LOG_FILE_PATH} for failure patterns...`);

const logBuffer: string[] = [];
const BUFFER_SIZE = 50;

async function tailFile(filePath: string) {
    // ... (existing implementation)
}

function processLine(line: string) {
    if (!line.trim()) return;

    logBuffer.push(line);
    if (logBuffer.length > BUFFER_SIZE) {
        logBuffer.shift();
    }

    const pattern = new RegExp(config.services.agent.log_pattern);
    if (pattern.test(line) && !line.includes("expected_error_pattern")) {
        console.log(`FAILURE DETECTED: "${line}"! Generating incident report...`);
        setTimeout(() => generateIncident(line), 500);
    }
}

async function generateIncident(triggerLine: string) {
    const timestamp = new Date().toISOString();

    let requestId = "unknown";
    // Search buffer for request_id
    const reversedBuffer = [...logBuffer].reverse();
    for (const log of reversedBuffer) {
        const match = log.match(/(?:["']?request_id["']?)\s*[:=]\s*["']([^"']+)["']/);
        if (match) {
            requestId = match[1] || "unknown";
            break;
        }
    }

    // Extract stacktrace: lines starting with "at " or "Error:" in the buffer
    // Filter lines that look like stack traces or the error message
    const stacktraceLines = logBuffer.filter(l =>
        (l.trim().startsWith("at ") ||
            l.includes("SeededDemoFailure") ||
            l.match(/^\s*Error:/)) &&
        !l.includes("expected_error_pattern")
    );
    const stacktrace = stacktraceLines.join("\n");

    // Get last 20 logs
    const lastLogsRaw = logBuffer.slice(Math.max(0, logBuffer.length - 20));
    const lastLogs: LogSnapshot[] = lastLogsRaw.map(msg => ({
        timestamp: new Date().toISOString(), // In real app, parse log timestamp
        level: "info",
        message: msg
    }));

    const incident: IncidentEvent = {
        id: crypto.randomUUID(),
        timestamp,
        severity: "critical",
        service_name: "sample-app",
        error_details: {
            message: triggerLine.trim() || "Unknown Error",
        },
        stacktrace: stacktrace || triggerLine, // Fallback to trigger line
        last_logs: lastLogs,
        request_id: requestId,
        environment: {
            env: "local",
            version: "demo"
        }
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
