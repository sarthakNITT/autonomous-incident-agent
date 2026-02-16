import { NextResponse } from "next/server";
import axios from "axios";
import { loadConfig } from "../../../../../../../../shared/config_loader";
import { ensureUserInDatabase } from "@/lib/user-sync";
import { auth } from "@clerk/nextjs/server";

const config = loadConfig();

const STATE_SERVICE_URL =
  process.env.STATE_SERVICE_URL || config.services.state.base_url;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;

    const { userId: authUserId } = await auth();
    if (!authUserId || authUserId !== userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureUserInDatabase();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    console.log(
      `[Projects API] Fetching projects for user: ${userId} from ${STATE_SERVICE_URL}`,
    );

    const response = await axios.get(
      `${STATE_SERVICE_URL}/projects/user/${userId}`,
    );

    console.log(`[Projects API] Found ${response.data?.length || 0} projects`);

    return NextResponse.json(response.data || []);
  } catch (error: any) {
    console.error(
      "[Projects API] Failed to fetch user projects:",
      error.message,
    );
    console.error("[Projects API] State service URL:", STATE_SERVICE_URL);
    console.error("[Projects API] Full error:", error);

    if (error.response?.status === 404 || error.response?.data?.length === 0) {
      return NextResponse.json([]);
    }

    return NextResponse.json([]);
  }
}
