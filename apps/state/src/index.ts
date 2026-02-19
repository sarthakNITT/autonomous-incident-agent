import { loadConfig } from "../../../shared/config_loader";
import { IncidentModel, ProjectModel } from "./models";
import type { CreateIncidentRequest, UpdateIncidentRequest } from "@repo/types";

const config = loadConfig();
const PORT = config.services.state.port;

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    try {
      if (req.method === "OPTIONS") {
        return new Response("OK", {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
          },
        });
      }

      if (req.method === "GET" && url.pathname === "/health") {
        return new Response(
          JSON.stringify({ status: "healthy", service: "state" }),
          {
            headers: { "Content-Type": "application/json" },
          },
        );
      }

      if (req.method === "GET" && url.pathname === "/incidents") {
        console.log(`[State] GET /incidents - Listing incidents`);
        const incidents = await IncidentModel.list();
        return returnResponse(incidents);
      }

      if (req.method === "POST" && url.pathname === "/incidents") {
        const body = (await req.json()) as CreateIncidentRequest;
        console.log(
          `[State] POST /incidents - Creating incident`,
          JSON.stringify(body),
        );
        const incident = await IncidentModel.create(body);
        return returnResponse(incident);
      }

      if (req.method === "POST" && url.pathname === "/projects") {
        const body = await req.json();
        const project = await ProjectModel.create(body);
        return returnResponse(project);
      }

      if (req.method === "GET" && url.pathname.startsWith("/projects/user/")) {
        const userId = url.pathname.split("/")[3];
        const projects = await ProjectModel.listByUser(userId);
        return returnResponse(projects);
      }

      if (req.method === "GET" && url.pathname.startsWith("/projects/")) {
        const id = url.pathname.split("/")[2];
        const project = await ProjectModel.get(id);
        return returnResponse(project);
      }

      if (url.pathname.startsWith("/incidents/")) {
        const parts = url.pathname.split("/");
        const id = parts[2];

        if (req.method === "GET" && parts.length === 3) {
          console.log(`[State] GET /incidents/${id} - Fetching incident`);
          const incident = await IncidentModel.get(id);
          return returnResponse(incident);
        }

        if (req.method === "POST" && url.pathname.endsWith("/update")) {
          const body = (await req.json()) as UpdateIncidentRequest;
          console.log(
            `[State] POST /incidents/${id}/update - Updating incident`,
            JSON.stringify(body),
          );
          const incident = await IncidentModel.update(id, body);
          return returnResponse(incident);
        }
      }
    } catch (e: any) {
      console.error("State Service Error", e);
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    return new Response("Not Found", { status: 404 });
  },
});

function returnResponse(data: any) {
  return new Response(JSON.stringify(data), {
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

console.log(`State Service listening on http://localhost:${PORT}`);
