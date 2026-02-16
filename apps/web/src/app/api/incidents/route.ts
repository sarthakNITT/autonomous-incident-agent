import { NextResponse } from "next/server";
import axios from "axios";
import { loadConfig } from "../../../../../../shared/config_loader";
import { R2Client } from "@repo/storage";

const config = loadConfig();
const storage = new R2Client(config.storage);

export async function GET() {
  try {
    const response = await axios.get(
      `${config.services.state.base_url}/incidents`,
    );
    const incidents = response.data;

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

    return NextResponse.json({ incidents: enrichedIncidents });
  } catch (e) {
    console.error("Failed to fetch incidents", e);
    return NextResponse.json({ incidents: [] });
  }
}
