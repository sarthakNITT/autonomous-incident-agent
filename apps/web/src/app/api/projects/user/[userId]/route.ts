import { NextResponse } from "next/server";
import axios from "axios";
import { loadConfig } from "../../../../../../../../shared/config_loader";

const config = loadConfig();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const response = await axios.get(
      `${config.services.state.base_url}/projects/user/${userId}`,
    );

    return NextResponse.json(response.data || []);
  } catch (error: any) {
    console.error("Failed to fetch user projects", error);

    if (error.response?.status === 404 || error.response?.data?.length === 0) {
      return NextResponse.json([]);
    }

    return NextResponse.json([]);
  }
}
