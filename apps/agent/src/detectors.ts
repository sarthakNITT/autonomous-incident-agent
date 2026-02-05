import type { OtelSpan, OtelLog, DetectorResult, DetectionConfig } from "@repo/types";

export class Detectors {
    constructor(private config: DetectionConfig) { }

    checkSpan(span: OtelSpan): DetectorResult[] {
        const results: DetectorResult[] = [];

        // Helper to get attr
        const getAttr = (key: string) => span.attributes.find(a => a.key === key)?.value;

        // 1. HTTP 5xx Detector
        // OTel semantic conventions: http.status_code
        const statusCodeStr = getAttr("http.status_code")?.intValue;
        // Sometimes strictly typed as int, sometimes string depending on SDK?
        // JSON encoding usually keeps numbers as numbers or strings depending on protobuf mapping.
        // We assume generic access.

        let statusCode = 0;
        if (statusCodeStr) statusCode = parseInt(statusCodeStr, 10);

        // Also check span status code (2 = Error)
        if (span.status.code === 2) {
            // It's an error, but is it an incident?
            // If http status is >= 500, yes.
            if (statusCode >= 500) {
                results.push({
                    triggered: true,
                    reason: `HTTP ${statusCode} Error: ${span.name}`,
                    type: "http_error",
                    scope: "span",
                    signal: span
                });
            }
        }

        // 2. Latency Detector
        const start = BigInt(span.startTimeUnixNano);
        const end = BigInt(span.endTimeUnixNano);
        const durationNanos = end - start;
        const durationMs = Number(durationNanos) / 1e6;

        if (durationMs > this.config.latencyThresholdMs) {
            results.push({
                triggered: true,
                reason: `High Latency: ${durationMs.toFixed(2)}ms (Threshold: ${this.config.latencyThresholdMs}ms)`,
                type: "latency",
                scope: "span",
                signal: span
            });
        }

        // 3. Exception Detector (Spans often record exceptions as Events)
        if (span.events) {
            for (const evt of span.events) {
                if (evt.name === "exception") {
                    const msg = evt.attributes.find(a => a.key === "exception.message")?.value.stringValue || "Unknown Exception";
                    const type = evt.attributes.find(a => a.key === "exception.type")?.value.stringValue || "Error";

                    results.push({
                        triggered: true,
                        reason: `Uncaught Exception: ${type}: ${msg}`,
                        type: "exception",
                        scope: "span",
                        signal: span
                    });
                }
            }
        }

        return results;
    }

    checkLog(log: OtelLog): DetectorResult[] {
        const results: DetectorResult[] = [];

        // 4. Exception (in Logs) / Crash
        // Severity Number > 17 is typically Error/Fatal
        if (log.severityNumber >= 17) {
            results.push({
                triggered: true,
                reason: `Error Log: ${log.body.stringValue}`,
                type: "exception",
                scope: "log",
                signal: log
            });
        }

        // Crash Detector - Specific patterns like "process exited"
        // This is heuristic if using OTel logs for stdout/stderr
        if (log.body.stringValue && log.body.stringValue.includes("Process exited with code")) {
            results.push({
                triggered: true,
                reason: `Process Crash: ${log.body.stringValue}`,
                type: "crash",
                scope: "log",
                signal: log
            });
        }

        return results;
    }
}
