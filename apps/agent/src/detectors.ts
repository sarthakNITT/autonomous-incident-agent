import type { OtelSpan, OtelLog, DetectorResult, DetectionConfig } from "@repo/types";

export class Detectors {
    constructor(private config: DetectionConfig) { }

    checkSpan(span: OtelSpan): DetectorResult[] {
        const results: DetectorResult[] = [];

        const getAttr = (key: string) => span.attributes.find(a => a.key === key)?.value;

        const statusCodeStr = getAttr("http.status_code")?.intValue;

        let statusCode = 0;
        if (statusCodeStr) statusCode = parseInt(statusCodeStr, 10);

        if (span.status.code === 2) {
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

        if (log.severityNumber >= 17) {
            results.push({
                triggered: true,
                reason: `Error Log: ${log.body.stringValue}`,
                type: "exception",
                scope: "log",
                signal: log
            });
        }

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
