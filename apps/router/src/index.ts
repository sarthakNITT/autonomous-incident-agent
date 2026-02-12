import type {
  IncidentEvent,
  RouterSnapshot,
  EnvMetadata,
  RepoRef,
} from "@repo/types";
import { join } from "path";
import { loadConfig } from "../../../shared/config_loader";
import { R2Client } from "@repo/storage";

const config = loadConfig();
const PORT = config.services.router.port;
const STATE_SERVICE_URL = config.services.state.base_url;

const storage = new R2Client(config.storage);

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === "POST" && url.pathname === "/ingest") {
      try {
        const event = (await req.json()) as IncidentEvent;
        console.log(`[Router] Received incident: ${event.id}`);

        const meta: EnvMetadata = {
          service_name: event.service_name || "unknown",
          env: event.environment?.env || "unknown",
          version: event.environment?.version || "unknown",
          received_at: new Date().toISOString(),
        };

        const repoRef: RepoRef = {
          repo_url: "local-sample-repo",
          commit: "demo-seeded",
          branch: "main",
        };

        const snapshot_id = crypto.randomUUID();

        const snapshot: RouterSnapshot = {
          snapshot_id: snapshot_id,
          event: event,
          env_metadata: meta,
          repo_git_ref: repoRef,
        };

        const key = `incidents/${event.id}/snapshot.json`;
        const eventKey = `incidents/${event.id}/event.json`;

        await storage.uploadJSON(eventKey, event);
        await storage.uploadJSON(key, snapshot);

        console.log(`[Router] Snapshot uploaded to R2: ${key}`);

        // Persist to state service database
        try {
          await fetch(`${STATE_SERVICE_URL}/incidents`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: event.id,
              service_name: event.service_name,
              severity: event.severity,
              status: "detected",
              title: `Incident in ${event.service_name}`,
              error_message: event.error_details?.message || "Unknown error",
              snapshot_id: snapshot_id,
              created_at: new Date().toISOString(),
            }),
          });
          console.log(`[Router] Incident persisted to state service`);

          // Trigger Autopsy Analysis
          const AUTOPSY_SERVICE_URL = config.services.autopsy.base_url;
          try {
            console.log(
              `[Router] Triggering Autopsy analysis for snapshot: ${key}`,
            );
            // Fire and forget - don't await the response to keep ingestion fast
            fetch(`${AUTOPSY_SERVICE_URL}/analyze`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                snapshot_key: key,
                incident_id: event.id,
              }),
            }).catch((e) =>
              console.error(`[Router] Failed to trigger Autopsy async:`, e),
            );
          } catch (autopsyError) {
            console.error(`[Router] Failed to trigger Autopsy:`, autopsyError);
          }
        } catch (stateError) {
          console.error(
            `[Router] Failed to persist to state service:`,
            stateError,
          );
          // Continue anyway
        }

        return new Response(
          JSON.stringify({
            status: "ingested",
            snapshot_id: snapshot.snapshot_id,
            key: key,
          }),
          {
            headers: { "Content-Type": "application/json" },
          },
        );
      } catch (e) {
        console.error("Ingest failed", e);
        return new Response("Internal Server Error", { status: 500 });
      }
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Router listening on http://localhost:${PORT}`);
