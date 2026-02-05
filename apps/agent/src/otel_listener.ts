import { Detectors } from "./detectors";
import type { OtelSpan, OtelLog } from "@repo/types";

export class OtelListener {
    private detectors: Detectors;
    private onIncident: (result: any) => Promise<void>;

    constructor(detectors: Detectors, onIncident: (result: any) => Promise<void>) {
        this.detectors = detectors;
        this.onIncident = onIncident;
    }

    async handleTrace(payload: any) {
        if (!payload.resourceSpans) return;

        for (const rs of payload.resourceSpans) {
            for (const ss of rs.scopeSpans || []) {
                for (const span of ss.spans || []) {
                    const otelSpan: OtelSpan = {
                        traceId: span.traceId,
                        spanId: span.spanId,
                        parentSpanId: span.parentSpanId,
                        name: span.name,
                        kind: span.kind,
                        startTimeUnixNano: span.startTimeUnixNano,
                        endTimeUnixNano: span.endTimeUnixNano,
                        attributes: span.attributes || [],
                        status: span.status || {},
                        events: span.events || []
                    };

                    const results = this.detectors.checkSpan(otelSpan);
                    for (const res of results) {
                        await this.onIncident(res);
                    }
                }
            }
        }
    }

    async handleLogs(payload: any) {
        if (!payload.resourceLogs) return;

        for (const rl of payload.resourceLogs) {
            for (const sl of rl.scopeLogs || []) {
                for (const log of sl.logRecords || []) {
                    const otelLog: OtelLog = {
                        timeUnixNano: log.timeUnixNano,
                        severityNumber: log.severityNumber,
                        severityText: log.severityText,
                        body: log.body || {},
                        attributes: log.attributes || [],
                        traceId: log.traceId,
                        spanId: log.spanId
                    };

                    const results = this.detectors.checkLog(otelLog);
                    for (const res of results) {
                        await this.onIncident(res);
                    }
                }
            }
        }
    }
}
