import type { Incident } from "@repo/types";

export function IncidentsPage(incidents: Incident[]) {
    return `
    <html>
        <head>
            <title>AIA Dashboard</title>
            <style>
                body { font-family: sans-serif; background: #f4f4f9; padding: 20px; }
                h1 { color: #333; }
                table { width: 100%; border-collapse: collapse; background: white; }
                th, td { padding: 12px; border-bottom: 1px solid #ddd; text-align: left; }
                tr:hover { background: #f1f1f1; cursor: pointer; }
                .status { padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; }
                .status.detected { background: #ffebee; color: #c62828; }
                .status.resolved { background: #e8f5e9; color: #2e7d32; }
                .status.analyzing { background: #e3f2fd; color: #1565c0; }
            </style>
        </head>
        <body>
            <h1>AIA Incidents</h1>
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Created At</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${incidents.map(i => `
                    <tr onclick="window.location='/incidents/${i.id}'">
                        <td>${i.id.substring(0, 8)}</td>
                        <td>${i.title}</td>
                        <td>${new Date(i.created_at).toLocaleString()}</td>
                        <td><span class="status ${i.status}">${i.status}</span></td>
                    </tr>
                    `).join("")}
                </tbody>
            </table>
        </body>
    </html>
    `;
}
