import type { ScenarioPayload, TriggerResponse } from "@repo/types";
import { loadConfig } from "../../../shared/config_loader";

const config = loadConfig();
const PORT = config.services.sample_app.port;

console.log(`Starting sample-app on port ${PORT}...`);

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
            // Actually, let's read the scenario payload
            return req.json().then((payload: any) => {
                if (payload.action === "cause_crash") {
                    // ReferenceError: config is not defined (Simulated)
                    // We do this by accessing a non-existent variable
                    // @ts-ignore
                    console.log(config_is_undefined);
                    return new Response("Crashed", { status: 500 });
                }

                if (payload.action === "cause_cpu") {
                    // Simulate CPU timeout
                    const start = Date.now();
                    while (Date.now() - start < 3000) { } // 3s block
                    throw new Error("Request Timeout - CPU Limit Exceeded");
                }

                // Original logic for other actions
                if (payload?.action === "cause_error") {
                    console.log("Triggering intentional failure scenario...");
                    const error = new Error("SeededDemoFailure: deterministic bug for AIA demo");
                    console.log(error.stack);
                    throw error;
                }

                const response: TriggerResponse = { status: "ok" };
                return new Response(JSON.stringify(response), {
                    headers: { "Content-Type": "application/json" },
                });
            }).catch((err) => {
                console.log("Unhandled error processing request:");
                console.log(err);
                if ((err as Error).message === "SeededDemoFailure: deterministic bug for AIA demo") {
                    return new Response(JSON.stringify({ status: "error", message: "Internal Server Error" }), {
                        status: 500,
                        headers: { "Content-Type": "application/json" }
                    });
                }
                // Match unexpected errors
                return new Response(JSON.stringify({ status: "error", message: "Internal Server Error" }), {
                    status: 500,
                    headers: { "Content-Type": "application/json" }
                });
            });
        }

        return new Response("Not Found", { status: 404 });
    },
});


console.log(`Server listening on http://localhost:${PORT}`);
