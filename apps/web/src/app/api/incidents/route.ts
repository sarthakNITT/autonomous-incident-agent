import { NextResponse } from "next/server";
import axios from "axios";
import { loadConfig } from "../../../../../../shared/config_loader";
import { R2Client } from "@repo/storage";

const config = loadConfig();
const storage = new R2Client(config.storage);

const STATE_SERVICE_URL =
  process.env.STATE_SERVICE_URL || config.services.state.base_url;

export async function GET() {
  try {
    console.log(
      `[Incidents API] Fetching from: ${STATE_SERVICE_URL}/incidents`,
    );

    const response = await axios.get(`${STATE_SERVICE_URL}/incidents`);
    const incidents = response.data;

    console.log(`[Incidents API] Fetched ${incidents.length} incidents`);

    const enrichedIncidents = await Promise.all(
      incidents.map(async (incident: any) => {
        let autopsy = null;
        let patchDiff = null;

        try {
          const autopsyData = await storage.downloadJSON(
            `incidents/${incident.id}/autopsy.json`,
          );
          autopsy = autopsyData;
        } catch (e) {}

        try {
          patchDiff = await storage.downloadText(
            `incidents/${incident.id}/patch.diff`,
          );
        } catch (e) {}

        return {
          ...incident,
          autopsy,
          patch_diff: patchDiff,
        };
      }),
    );

    console.log(
      `[Incidents API] Returning ${enrichedIncidents.length} enriched incidents`,
    );
    return NextResponse.json({ incidents: enrichedIncidents });
  } catch (e: any) {
    console.error("[Incidents API] Failed to fetch incidents:", e.message);
    console.error("[Incidents API] State service URL:", STATE_SERVICE_URL);
    console.error("[Incidents API] Full error:", e);
    return NextResponse.json({ incidents: [] });
  }
}
