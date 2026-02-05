export type OtelTraceId = string;
export type OtelSpanId = string;

// Minimal OTLP JSON-like structures
export interface OtelSpan {
    traceId: OtelTraceId;
    spanId: OtelSpanId;
    parentSpanId?: OtelSpanId;
    name: string;
    kind: number; // 1: Internal, 2: Server, 3: Client, etc.
    startTimeUnixNano: string;
    endTimeUnixNano: string;
    attributes: Array<{
        key: string;
        value: { stringValue?: string; intValue?: string; boolValue?: boolean; };
    }>;
    status: {
        code: number; // 1: OK, 2: Error
        message?: string;
    };
    events?: Array<{
        timeUnixNano: string;
        name: string;
        attributes: Array<{ key: string; value: { stringValue?: string; }; }>;
    }>;
    // ... other fields omitted for MVP
}

export interface OtelLog {
    timeUnixNano: string;
    severityNumber: number;
    severityText: string;
    body: { stringValue?: string };
    attributes: Array<{
        key: string;
        value: { stringValue?: string; };
    }>;
    traceId?: OtelTraceId;
    spanId?: OtelSpanId;
}

export interface DetectorResult {
    triggered: boolean;
    reason?: string;
    type: "http_error" | "latency" | "exception" | "crash";
    scope: "span" | "log";
    signal: OtelSpan | OtelLog;
}

export interface DetectionConfig {
    latencyThresholdMs: number;
}
