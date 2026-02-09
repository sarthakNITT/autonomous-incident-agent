import { loadConfig } from "../../../shared/config_loader";
import { IncidentsPage } from "./pages/Incidents";
import { IncidentDetailPage } from "./pages/IncidentDetail";
import { R2Client } from "@repo/storage";
import type { Incident } from "@repo/types";

const config = loadConfig();
const PORT = config.services.web_backup.port;
const storage = new R2Client(config.storage);

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    if (
      req.method === "GET" &&
      (url.pathname === "/" || url.pathname === "/incidents")
    ) {
      try {
        const res = await fetch(`${config.services.state.base_url}/incidents`);
        const incidents = (await res.json()) as Incident[];
        return new Response(IncidentsPage(incidents), {
          headers: { "Content-Type": "text/html" },
        });
      } catch (e) {
        return new Response("Error fetching incidents", { status: 500 });
      }
    }

    if (req.method === "GET" && url.pathname.startsWith("/incidents/")) {
      const id = url.pathname.split("/")[2];
      try {
        const res = await fetch(
          `${config.services.state.base_url}/incidents/${id}`,
        );
        const incident = (await res.json()) as Incident;

        let patch = null;
        let logs = null;

        if (incident.patch_diff_key) {
          patch = await storage
            .downloadText(incident.patch_diff_key)
            .catch(() => null);
        }

        logs = await storage
          .downloadText(`incidents/${id}/repro/post.txt`)
          .catch(() => null);

        return new Response(IncidentDetailPage(incident, patch, logs), {
          headers: { "Content-Type": "text/html" },
        });
      } catch (e) {
        return new Response("Incident not found", { status: 404 });
      }
    }

    if (req.method === "POST" && url.pathname.startsWith("/api/incidents/")) {
      const parts = url.pathname.split("/");
      const id = parts[3];
      const action = parts[4]; // approve or reject

      const status = action === "approve" ? "resolved" : "failed";

      await fetch(`${config.services.state.base_url}/incidents/${id}/update`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      return new Response("Updated", { status: 200 });
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Web Dashboard listening on http://localhost:${PORT}`);
