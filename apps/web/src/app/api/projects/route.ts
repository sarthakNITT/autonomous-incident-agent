import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { loadConfig } from "../../../../../../shared/config_loader";

const config = loadConfig();

const STATE_SERVICE_URL =
  process.env.STATE_SERVICE_URL || config.services.state.base_url;

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (!body.name || !body.repoUrl) {
      return NextResponse.json(
        { error: "Project name and repository URL are required" },
        { status: 400 },
      );
    }

    console.log(
      `[Projects API] Creating project for user: ${userId} at ${STATE_SERVICE_URL}`,
    );

    const response = await fetch(`${STATE_SERVICE_URL}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, userId }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Projects API] State service error:", data);
      return NextResponse.json(
        { error: data.error || "Failed to create project" },
        { status: response.status },
      );
    }

    console.log(`[Projects API] Project created:`, data);
    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("[Projects API] Failed to create project:", error.message);
    return NextResponse.json(
      { error: "Failed to create project", details: error.message },
      { status: 500 },
    );
  }
}
