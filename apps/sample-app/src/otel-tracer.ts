import { loadConfig } from "../../../shared/config_loader";

const config = loadConfig();
const AGENT_URL = config.services.agent.base_url;

interface SpanData {
  name: string;
  kind: number;
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  startTimeUnixNano: string;
  endTimeUnixNano: string;
  attributes: Record<string, any>;
  status?: {
    code: number;
    message?: string;
  };
  events?: Array<{
    timeUnixNano: string;
    name: string;
    attributes: Record<string, any>;
  }>;
}

export class SimpleOTELTracer {
  private serviceName: string;

  constructor(serviceName: string) {
    this.serviceName = serviceName;
  }

  private generateId(length: number = 16): string {
    return Array.from({ length }, () =>
      Math.floor(Math.random() * 16).toString(16),
    ).join("");
  }

  private nanoTime(): string {
    return (Date.now() * 1000000).toString();
  }

  async sendTrace(spanData: Partial<SpanData>) {
    const traceId = this.generateId(32);
    const spanId = this.generateId(16);
    const now = this.nanoTime();

    const span: SpanData = {
      name: spanData.name || "http.request",
      kind: 2, // SPAN_KIND_SERVER
      traceId,
      spanId,
      startTimeUnixNano: spanData.startTimeUnixNano || now,
      endTimeUnixNano: spanData.endTimeUnixNano || now,
      attributes: {
        "service.name": this.serviceName,
        ...spanData.attributes,
      },
      status: spanData.status,
      events: spanData.events,
    };

    const payload = {
      resourceSpans: [
        {
          resource: {
            attributes: [
              {
                key: "service.name",
                value: { stringValue: this.serviceName },
              },
            ],
          },
          scopeSpans: [
            {
              scope: { name: "sample-app-tracer", version: "1.0.0" },
              spans: [span],
            },
          ],
        },
      ],
    };

    try {
      await fetch(`${AGENT_URL}/v1/traces`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      console.log(`[OTEL] Trace sent to agent: ${span.name}`);
    } catch (error) {
      console.error("[OTEL] Failed to send trace:", error);
    }
  }

  async recordError(error: Error, context: Record<string, any> = {}) {
    const now = this.nanoTime();

    await this.sendTrace({
      name: "error.handler",
      startTimeUnixNano: now,
      endTimeUnixNano: now,
      attributes: {
        "error.type": error.name,
        "error.message": error.message,
        "error.stack": error.stack,
        "http.status_code": context.statusCode || 500,
        "http.method": context.method || "POST",
        "http.route": context.route || "/trigger",
        ...context,
      },
      status: {
        code: 2, // STATUS_CODE_ERROR
        message: error.message,
      },
      events: [
        {
          timeUnixNano: now,
          name: "exception",
          attributes: {
            "exception.type": error.name,
            "exception.message": error.message,
            "exception.stacktrace": error.stack || "",
          },
        },
      ],
    });
  }
}
