import { NextResponse } from "next/server";
import axios from "axios";

const ROUTER_URL = process.env.ROUTER_URL || "http://localhost:3003";

export async function GET() {
  try {
    const response = await axios.get(`${ROUTER_URL}/health`, {
      timeout: 5000,
    });

    if (response.status === 200) {
      return NextResponse.json({ status: "healthy", backend: "connected" });
    }

    return NextResponse.json(
      { status: "unhealthy", backend: "error" },
      { status: 503 },
    );
  } catch (error) {
    console.error("Backend health check failed:", error);
    return NextResponse.json(
      {
        status: "unhealthy",
        backend: "unreachable",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 },
    );
  }
}
