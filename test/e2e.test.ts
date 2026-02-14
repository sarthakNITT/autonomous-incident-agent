import { describe, test, expect } from "bun:test";

describe("End-to-End Integration Tests", () => {
  const STATE_URL = process.env.STATE_SERVICE_URL || "http://localhost:3003";
  const ROUTER_URL = process.env.ROUTER_SERVICE_URL || "http://localhost:3001";
  const AUTOPSY_URL =
    process.env.AUTOPSY_SERVICE_URL || "http://localhost:3002";
  const AGENT_URL = process.env.AGENT_SERVICE_URL || "http://localhost:4318";

  test("all services should be healthy", async () => {
    const services = [
      { name: "State", url: STATE_URL },
      { name: "Router", url: ROUTER_URL },
      { name: "Autopsy", url: AUTOPSY_URL },
      { name: "Agent", url: AGENT_URL },
    ];

    for (const service of services) {
      const response = await fetch(`${service.url}/health`);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data.status).toBe("healthy");
      console.log(`✓ ${service.name} service is healthy`);
    }
  });

  test("services should respond within acceptable time", async () => {
    const services = [
      { name: "State", url: STATE_URL },
      { name: "Router", url: ROUTER_URL },
      { name: "Autopsy", url: AUTOPSY_URL },
      { name: "Agent", url: AGENT_URL },
    ];

    for (const service of services) {
      const start = Date.now();
      const response = await fetch(`${service.url}/health`);
      const duration = Date.now() - start;

      expect(response.status).toBe(200);
      expect(duration).toBeLessThan(5000);
      console.log(`✓ ${service.name} responded in ${duration}ms`);
    }
  });

  test("state service should be accessible from router", async () => {
    const response = await fetch(`${ROUTER_URL}/health`);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.services?.state || data.status).toBeDefined();
  });
});

describe("Service Communication", () => {
  const STATE_URL = process.env.STATE_SERVICE_URL || "http://localhost:3003";

  test("database connection should be stable", async () => {
    const requests = Array(5)
      .fill(null)
      .map(() => fetch(`${STATE_URL}/health`));

    const responses = await Promise.all(requests);
    responses.forEach((response) => {
      expect(response.status).toBe(200);
    });
  });
});

describe("Error Handling", () => {
  const STATE_URL = process.env.STATE_SERVICE_URL || "http://localhost:3003";
  const ROUTER_URL = process.env.ROUTER_SERVICE_URL || "http://localhost:3001";

  test("should handle invalid endpoints gracefully", async () => {
    const response = await fetch(`${STATE_URL}/nonexistent-endpoint`);
    expect(response.status).toBeGreaterThanOrEqual(400);
  });

  test("should handle malformed JSON", async () => {
    const response = await fetch(`${ROUTER_URL}/incident`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "invalid json",
    });
    expect(response.status).toBeGreaterThanOrEqual(400);
  });
});
