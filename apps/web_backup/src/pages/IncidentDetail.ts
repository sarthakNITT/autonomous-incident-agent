import type { Incident } from "@repo/types";
import { Timeline } from "../components/Timeline";
import { Approval } from "../components/Approval";

export function IncidentDetailPage(
  incident: Incident,
  patchContent: string | null,
  logs: string | null,
) {
  return `
    <html>
        <head>
            <title>Incident ${incident.id}</title>
            <style>
                body { font-family: sans-serif; background: #fff; padding: 20px; max-width: 1000px; margin: 0 auto; }
                h1 { border-bottom: 1px solid #eee; padding-bottom: 10px; }
                .section { margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 5px; }
                pre { background: #222; color: #eee; padding: 10px; overflow-x: auto; border-radius: 4px; }
                .timeline { display: flex; gap: 10px; margin-bottom: 20px; }
                .step { flex: 1; padding: 10px; background: #ddd; text-align: center; border-radius: 4px; font-size: 0.9em; }
                .step.active { background: #2196f3; color: white; font-weight: bold; }
                .step.completed { background: #4caf50; color: white; }
                .step.error { background: #f44336; color: white; }
                .btn { padding: 10px 20px; border: none; cursor: pointer; font-size: 1em; border-radius: 4px; color: white; margin-right: 10px; }
                .approve { background: #4caf50; }
                .reject { background: #f44336; }
                a { color: #2196f3; text-decoration: none; }
                a:hover { text-decoration: underline; }
            </style>
        </head>
        <body>
            <a href="/incidents">&larr; Back to List</a>
            <h1>Incident: ${incident.title}</h1>
            
            ${Timeline(incident.status)}
            
            <div class="section">
                <h3>Root Cause</h3>
                <p>${incident.root_cause || "Pending analysis..."}</p>
                <p><strong>Status:</strong> ${incident.status}</p>
            </div>

            ${
              patchContent
                ? `
            <div class="section">
                <h3>Proposed Patch</h3>
                <pre>${patchContent}</pre>
            </div>
            `
                : ""
            }

            ${
              logs
                ? `
            <div class="section">
                <h3>Validation Logs</h3>
                <pre>${logs}</pre>
            </div>
            `
                : ""
            }

            <div class="section">
                <h3>Actions</h3>
                ${Approval(incident.id, incident.status)}
                
                ${incident.pr_url ? `<p><a href="${incident.pr_url}" target="_blank">View GitHub PR</a></p>` : ""}
            </div>
        </body>
    </html>
    `;
}
