import { describe, test, expect, beforeAll } from "bun:test";

describe("State Service Health Check", () => {
  const STATE_URL = process.env.STATE_SERVICE_URL || "http://localhost:3003";

  test("should respond to health check", async () => {
    const response = await fetch(`${STATE_URL}/health`);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.status).toBe("healthy");
  });

  test("should have database connection", async () => {
    const response = await fetch(`${STATE_URL}/health`);
    const data = await response.json();
    expect(data.database).toBe("connected");
  });
});

describe("State Service API", () => {
  const STATE_URL = process.env.STATE_SERVICE_URL || "http://localhost:3003";

  test("should list projects (empty or with data)", async () => {
    const response = await fetch(`${STATE_URL}/projects`);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test("should list incidents (empty or with data)", async () => {
    const response = await fetch(`${STATE_URL}/incidents`);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  test("should reject invalid project creation", async () => {
    const response = await fetch(`${STATE_URL}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}), // Invalid: missing required fields
    });
    expect(response.status).toBeGreaterThanOrEqual(400);
  });
});
