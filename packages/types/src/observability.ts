export type OtelTraceId = string;
export type OtelSpanId = string;

export interface OtelSpan {
  traceId: OtelTraceId;
  spanId: OtelSpanId;
  parentSpanId?: OtelSpanId;
  name: string;
  kind: number;
  startTimeUnixNano: string;
  endTimeUnixNano: string;
  attributes: Array<{
    key: string;
    value: { stringValue?: string; intValue?: string; boolValue?: boolean };
  }>;
  status: {
    code: number;
    message?: string;
  };
  events?: Array<{
    timeUnixNano: string;
    name: string;
    attributes: Array<{ key: string; value: { stringValue?: string } }>;
  }>;
}

export interface OtelLog {
  timeUnixNano: string;
  severityNumber: number;
  severityText: string;
  body: { stringValue?: string };
  attributes: Array<{
    key: string;
    value: { stringValue?: string };
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
  stacktrace?: string;
}

export interface DetectionConfig {
  latencyThresholdMs: number;
}
