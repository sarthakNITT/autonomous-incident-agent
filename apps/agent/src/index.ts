import type { IncidentEvent, LogSnapshot } from "@repo/types";
import { join } from "path";

const LOG_FILE_PATH = "/logs/app.log";
const EVENTS_DIR = "/events";
const INCIDENT_FILE = "incident-1.json";

console.log("Starting AIA Agent...");
console.log(`Monitoring ${LOG_FILE_PATH} for failure patterns...`);

const logBuffer: string[] = [];
const BUFFER_SIZE = 50; // Keep enough to find request_id and give 20 lines context

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

    logBuffer.push(line);
    if (logBuffer.length > BUFFER_SIZE) {
        logBuffer.shift();
    }

    if (line.includes("SeededDemoFailure") && !line.includes("expected_error_pattern")) {
        console.log("FAILURE DETECTED! Generating incident report...");
        // Wait briefly to allow stacktrace lines to accumulate
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
            message: "SeededDemoFailure: deterministic bug for AIA demo",
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
