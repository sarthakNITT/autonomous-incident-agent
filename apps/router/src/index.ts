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

    // Health check endpoint
    if (req.method === "GET" && url.pathname === "/health") {
      return new Response(
        JSON.stringify({ status: "healthy", service: "router" }),
        {
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (req.method === "POST" && url.pathname === "/ingest") {
      try {
        const event = (await req.json()) as IncidentEvent;
        console.log(
          `[Router] Received incident: ${event.id} (project: ${event.project_id || "none"})`,
        );

        let projectConfig: any = null;
        if (event.project_id) {
          try {
            const projectRes = await fetch(
              `${STATE_SERVICE_URL}/projects/${event.project_id}`,
            );
            if (projectRes.ok) {
              projectConfig = await projectRes.json();
              console.log(
                `[Router] Loaded project config: ${projectConfig.name}`,
              );
            } else {
              console.warn(
                `[Router] Project ${event.project_id} not found, using defaults`,
              );
            }
          } catch (e) {
            console.error(`[Router] Failed to fetch project config:`, e);
          }
        }

        const meta: EnvMetadata = {
          service_name: event.service_name || "unknown",
          env: event.environment?.env || "unknown",
          version: event.environment?.version || "unknown",
          received_at: new Date().toISOString(),
        };

        const repoRef: RepoRef = {
          repo_url: projectConfig?.repo_url || "local-sample-repo",
          commit: "demo-seeded",
          branch: projectConfig?.base_branch || "main",
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
              repo_name: projectConfig?.name || event.service_name,
              file_path: "analyzing...",
              created_at: new Date().toISOString(),
            }),
          });
          console.log(`[Router] Incident persisted to state service`);

          const AUTOPSY_SERVICE_URL = config.services.autopsy.base_url;
          try {
            console.log(
              `[Router] Triggering Autopsy analysis for snapshot: ${key}`,
            );

            const autopsyPayload: any = {
              snapshot_key: key,
              incident_id: event.id,
            };

            if (projectConfig) {
              autopsyPayload.github_token = projectConfig.github_token;
              autopsyPayload.openai_api_key = projectConfig.openai_api_key;
              autopsyPayload.repo_url = projectConfig.repo_url;
              autopsyPayload.base_branch = projectConfig.base_branch;
            }

            fetch(`${AUTOPSY_SERVICE_URL}/analyze`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(autopsyPayload),
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
