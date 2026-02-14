import { describe, test, expect } from "bun:test";

describe("Agent Service Health Check", () => {
  const AGENT_URL = process.env.AGENT_SERVICE_URL || "http://localhost:4318";

  test("should respond to health check", async () => {
    const response = await fetch(`${AGENT_URL}/health`);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.status).toBe("healthy");
  });

  test("should accept OTel traces endpoint", async () => {
    // Just verify the endpoint exists
    const response = await fetch(`${AGENT_URL}/v1/traces`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        resourceSpans: [],
      }),
    });
    // Should accept the request (even if empty)
    expect([200, 202, 400]).toContain(response.status);
  });
});
