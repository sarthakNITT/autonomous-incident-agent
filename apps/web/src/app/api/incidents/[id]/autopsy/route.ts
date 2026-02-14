import { NextResponse } from "next/server";
import { R2Client } from "@repo/storage";
import { loadConfig } from "../../../../../../../../shared/config_loader";

const config = loadConfig();
const storage = new R2Client(config.storage);

export async function GET(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const autopsyJson = await storage.downloadJSON(
      `incidents/${params.id}/autopsy.json`,
    );
    return NextResponse.json(autopsyJson);
  } catch (e) {
    console.error(`Failed to fetch autopsy for ${params.id}:`, e);
    return NextResponse.json({}, { status: 404 });
  }
}
