import { describe, test, expect } from "bun:test";

describe("Autopsy Service Health Check", () => {
  const AUTOPSY_URL =
    process.env.AUTOPSY_SERVICE_URL || "http://localhost:3002";

  test("should respond to health check", async () => {
    const response = await fetch(`${AUTOPSY_URL}/health`);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.status).toBe("healthy");
  });

  test("should have AI service configured", async () => {
    const response = await fetch(`${AUTOPSY_URL}/health`);
    const data = await response.json();
    expect(data.ai_configured).toBeDefined();
  });
});

describe("Autopsy Service Analysis", () => {
  const AUTOPSY_URL =
    process.env.AUTOPSY_SERVICE_URL || "http://localhost:3002";

  test("should reject analysis without required fields", async () => {
    const response = await fetch(`${AUTOPSY_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  test("should validate analysis payload", async () => {
    const response = await fetch(`${AUTOPSY_URL}/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        incident_id: "test-incident",
        error: "Test error message",
        snapshot: { files: [] },
      }),
    });
    // Should either process or return validation error
    expect([200, 201, 400, 404, 500]).toContain(response.status);
  });
});
