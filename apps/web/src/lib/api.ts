import type {
  Incident,
  IncidentStatus,
  UpdateIncidentRequest,
} from "@repo/types";

const STATE_SERVICE_URL =
  process.env.NEXT_PUBLIC_STATE_SERVICE_URL || "http://localhost:3006";

export async function getIncidents(): Promise<Incident[]> {
  const response = await fetch(`${STATE_SERVICE_URL}/incidents`);
  if (!response.ok) {
    throw new Error("Failed to fetch incidents");
  }
  return response.json();
}

export async function getIncident(id: string): Promise<Incident> {
  const response = await fetch(`${STATE_SERVICE_URL}/incidents/${id}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch incident ${id}`);
  }
  return response.json();
}

export async function updateIncident(
  id: string,
  data: UpdateIncidentRequest,
): Promise<Incident> {
  const response = await fetch(`${STATE_SERVICE_URL}/incidents/${id}/update`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error(`Failed to update incident ${id}`);
  }
  return response.json();
}

export async function fetchArtifact(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch artifact from ${url}`);
  }
  return response.text();
}

export function getStatusColor(status: IncidentStatus): "primary" | "muted" {
  if (
    status === "patching" ||
    status === "validating" ||
    status === "resolved"
  ) {
    return "primary";
  }
  return "muted";
}
