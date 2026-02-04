import type { BugPayload, ApiResponse } from "@repo/types";

const port = process.env.PORT || 3000;

console.log(`Starting sample-app on port ${port}...`);

const server = Bun.serve({
    port: Number(port),
    async fetch(req) {
        const url = new URL(req.url);

        // Health check
        if (url.pathname === "/health") {
            return new Response(JSON.stringify({ status: "ok" }), {
                headers: { "Content-Type": "application/json" },
            });
        }

        // Trigger endpoint
        if (url.pathname === "/trigger" && req.method === "POST") {
            try {
                const body = (await req.json()) as BugPayload;

                console.log("Received trigger request:", body);

                if (body.payload?.action === "cause_error") {
                    console.error("Triggering intentional failure scenario...");
                    // Deterministic stack trace printing
                    const error = new Error("SeededDemoFailure: deterministic bug for AIA demo");
                    console.error(error.stack);
                    throw error;
                }

                const response: ApiResponse = { status: "ok", message: "No error triggered" };
                return new Response(JSON.stringify(response), {
                    headers: { "Content-Type": "application/json" },
                });

            } catch (err) {
                // Ensure we print the error to stderr so it shows up in Docker logs as expected
                console.error("Unhandled error processing request:");
                console.error(err);
                return new Response(JSON.stringify({ status: "error", message: "Internal Server Error" }), {
                    status: 500,
                    headers: { "Content-Type": "application/json" }
                });
            }
        }

        return new Response("Not Found", { status: 404 });
    },
});

console.log(`Server listening on http://localhost:${server.port}`);
