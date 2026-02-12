import type {
  OtelSpan,
  OtelLog,
  DetectorResult,
  DetectionConfig,
} from "@repo/types";

export class Detectors {
  constructor(private config: DetectionConfig) {}

  checkSpan(span: OtelSpan): DetectorResult[] {
    const results: DetectorResult[] = [];

    const getAttr = (key: string) => {
      if (Array.isArray(span.attributes)) {
        return span.attributes.find((a) => a.key === key)?.value;
      } else if (typeof span.attributes === "object") {
        return span.attributes[key];
      }
      return undefined;
    };

    const statusCodeAttr = getAttr("http.status_code");
    let statusCode = 0;
    if (statusCodeAttr) {
      if (typeof statusCodeAttr === "number") {
        statusCode = statusCodeAttr;
      } else if (statusCodeAttr.intValue) {
        statusCode = parseInt(statusCodeAttr.intValue, 10);
      }
    }

    if (span.status?.code === 2) {
      if (statusCode >= 500) {
        results.push({
          triggered: true,
          reason: `HTTP ${statusCode} Error: ${span.name}`,
          type: "http_error",
          scope: "span",
          signal: span,
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
        signal: span,
      });
    }

    if (span.events) {
      for (const evt of span.events) {
        if (evt.name === "exception") {
          let msg = "Unknown Exception";
          let type = "Error";
          let stacktrace = "";

          if (Array.isArray(evt.attributes)) {
            msg =
              evt.attributes.find((a) => a.key === "exception.message")?.value
                .stringValue || msg;
            type =
              evt.attributes.find((a) => a.key === "exception.type")?.value
                .stringValue || type;
            stacktrace =
              evt.attributes.find((a) => a.key === "exception.stacktrace")
                ?.value.stringValue || stacktrace;
          } else if (typeof evt.attributes === "object") {
            msg = evt.attributes["exception.message"] || msg;
            type = evt.attributes["exception.type"] || type;
            stacktrace = evt.attributes["exception.stacktrace"] || stacktrace;
          }

          results.push({
            triggered: true,
            reason: `Uncaught Exception: ${type}: ${msg}`,
            type: "exception",
            scope: "span",
            signal: span,
            stacktrace: stacktrace,
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
        signal: log,
      });
    }

    if (
      log.body.stringValue &&
      log.body.stringValue.includes("Process exited with code")
    ) {
      results.push({
        triggered: true,
        reason: `Process Crash: ${log.body.stringValue}`,
        type: "crash",
        scope: "log",
        signal: log,
      });
    }

    return results;
  }
}
