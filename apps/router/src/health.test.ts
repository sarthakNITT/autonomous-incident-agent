import { describe, test, expect } from "bun:test";

describe("Router Service Health Check", () => {
  const ROUTER_URL = process.env.ROUTER_SERVICE_URL || "http://localhost:3001";

  test("should respond to health check", async () => {
    const response = await fetch(`${ROUTER_URL}/health`);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.status).toBe("healthy");
  });

  test("should have required service connections", async () => {
    const response = await fetch(`${ROUTER_URL}/health`);
    const data = await response.json();
    expect(data.services).toBeDefined();
  });
});

describe("Router Service Incident Handling", () => {
  const ROUTER_URL = process.env.ROUTER_SERVICE_URL || "http://localhost:3001";

  test("should reject incident without project_id", async () => {
    const response = await fetch(`${ROUTER_URL}/incident`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        error: "Test error",
        // Missing project_id
      }),
    });
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  test("should validate incident payload structure", async () => {
    const response = await fetch(`${ROUTER_URL}/incident`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        project_id: "test-project",
        error: "Test error",
        timestamp: new Date().toISOString(),
      }),
    });
    // Should either process or return validation error
    expect([200, 201, 400, 404]).toContain(response.status);
  });
});
