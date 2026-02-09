import { loadConfig } from "../../../shared/config_loader";
import { IncidentModel } from "./models";
import type { CreateIncidentRequest, UpdateIncidentRequest } from "@repo/types";

const config = loadConfig();
const PORT = config.services.state.port;

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    try {
      if (req.method === "GET" && url.pathname === "/incidents") {
        const incidents = await IncidentModel.list();
        return returnResponse(incidents);
      }

      if (req.method === "POST" && url.pathname === "/incidents") {
        const body = (await req.json()) as CreateIncidentRequest;
        const incident = await IncidentModel.create(body);
        return returnResponse(incident);
      }

      if (url.pathname.startsWith("/incidents/")) {
        const id = url.pathname.split("/")[2];

        if (req.method === "GET") {
          const incident = await IncidentModel.get(id);
          return returnResponse(incident);
        }

        if (req.method === "POST" && url.pathname.endsWith("/update")) {
          const body = (await req.json()) as UpdateIncidentRequest;
          const incident = await IncidentModel.update(id, body);
          return returnResponse(incident);
        }
      }
    } catch (e: any) {
      console.error("State Service Error", e);
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
      });
    }

    return new Response("Not Found", { status: 404 });
  },
});

function returnResponse(data: any) {
  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
}

console.log(`State Service listening on http://localhost:${PORT}`);
