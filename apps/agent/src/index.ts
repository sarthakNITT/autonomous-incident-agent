import { loadConfig } from "../../../shared/config_loader";
import { Detectors } from "./detectors";
import { OtelListener } from "./otel_listener";
import { R2Client } from "@repo/storage";
import type { DetectorResult, IncidentEvent, LogSnapshot } from "@repo/types";

const config = loadConfig();
const detectionConfig = { latencyThresholdMs: 2000 };
const detectors = new Detectors(detectionConfig);
const storage = new R2Client(config.storage);

console.log("Starting Autonomous Observability Agent (OTel Receiver)...");

const onIncident = async (result: DetectorResult) => {
    console.log(`[Agent] DETECTED INCIDENT: ${result.type} - ${result.reason}`);

    const event: IncidentEvent = {
        id: crypto.randomUUID(),
        service_name: config.project_name,
        environment: { env: config.environment, version: "v1.2.0" },
        timestamp: new Date().toISOString(),
        severity: "critical",
        error_details: {
            message: result.reason || "Unknown Error"
        },
        stacktrace: getDetailsFromSignal(result),
        last_logs: [],
        request_id: getRequestId(result)
    };

    const key = `incidents/${event.id}/event.json`;
    await storage.uploadJSON(key, event);
    console.log(`[Agent] Helper Event Uploaded to R2: ${key}`);

    const routerUrl = `${config.services.router.base_url}/ingest`;
    try {
        await fetch(routerUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(event)
        });
        console.log(`[Agent] Sent to Router: ${routerUrl}`);
    } catch (e) {
        console.error(`[Agent] Failed to contact Router: ${e}`);
    }
};

function getRequestId(result: DetectorResult): string {
    if (result.scope === "span") {
        const s = result.signal as any;
        return s.traceId || "unknown";
    }
    return "unknown";
}

function getDetailsFromSignal(result: DetectorResult): string {
    if (result.scope === "span") {
        const s = result.signal as any;
        if (result.type === "exception") {
            return `Exception in Span ${s.name}: ${result.reason}`;
        }
        return `Trace Issue in Span ${s.name}: ${result.reason}`;
    } else {
        const l = result.signal as any;
        return `Log Issue: ${l.body?.stringValue || "Unknown log"}`;
    }
}

const listener = new OtelListener(detectors, onIncident);

const PORT = 4318;

Bun.serve({
    port: PORT,
    async fetch(req) {
        const url = new URL(req.url);
        if (req.method === "POST") {
            try {
                const body = await req.json();
                if (url.pathname === "/v1/traces") {
                    await listener.handleTrace(body);
                    return new Response(JSON.stringify({ partialSuccess: {} }), { status: 200, headers: { "Content-Type": "application/json" } });
                }
                if (url.pathname === "/v1/logs") {
                    await listener.handleLogs(body);
                    return new Response(JSON.stringify({ partialSuccess: {} }), { status: 200, headers: { "Content-Type": "application/json" } });
                }
            } catch (e) {
                console.error("OTel Ingest Error", e);
                return new Response("Error", { status: 500 });
            }
        }
        return new Response("Not Found", { status: 404 });
    }
});

console.log(`Agent OTLP Receiver listening on http://localhost:${PORT}`);
console.log("Send traces to http://localhost:4318/v1/traces");
