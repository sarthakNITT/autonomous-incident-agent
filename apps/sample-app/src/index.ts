import type { ScenarioPayload, TriggerResponse } from "@repo/types";
import { loadConfig } from "../../../shared/config_loader";
import { SimpleOTELTracer } from "./otel-tracer";

const config = loadConfig();
const PORT = config.services.sample_app.port;

const tracer = new SimpleOTELTracer("sample-app");

console.log(`Starting sample-app on port ${PORT}...`);
console.log(`OTEL Agent endpoint: ${config.services.agent.base_url}`);

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/health") {
      return new Response(JSON.stringify({ status: "ok" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (req.method === "POST" && url.pathname === "/trigger") {
      return req
        .json()
        .then((payload: any) => {
          if (payload.action === "cause_crash") {
            throw new ReferenceError("config_is_undefined is not defined");
            return new Response("Crashed", { status: 500 });
          }

          if (payload.action === "cause_cpu") {
            const start = Date.now();
            while (Date.now() - start < 3000) {}
            throw new Error("Request Timeout - CPU Limit Exceeded");
          }

          if (payload?.action === "cause_error") {
            console.log("Triggering intentional failure scenario...");
            const error = new Error(
              "SeededDemoFailure: deterministic bug for AIA demo",
            );
            console.log(error.stack);
            throw error;
          }

          const response: TriggerResponse = { status: "ok" };
          return new Response(JSON.stringify(response), {
            headers: { "Content-Type": "application/json" },
          });
        })
        .catch(async (err) => {
          console.log("Unhandled error processing request:");
          console.log(err);

          await tracer.recordError(err, {
            method: req.method,
            route: url.pathname,
            statusCode: 500,
          });
          console.log("[OTEL] Error sent to agent for analysis");

          if (
            (err as Error).message ===
            "SeededDemoFailure: deterministic bug for AIA demo"
          ) {
            return new Response(
              JSON.stringify({
                status: "error",
                message: "Internal Server Error",
              }),
              {
                status: 500,
                headers: { "Content-Type": "application/json" },
              },
            );
          }
          return new Response(
            JSON.stringify({
              status: "error",
              message: "Internal Server Error",
            }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            },
          );
        });
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server listening on http://localhost:${PORT}`);
