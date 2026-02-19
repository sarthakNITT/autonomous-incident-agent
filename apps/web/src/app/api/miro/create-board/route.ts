import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { incident_id, title, description, root_cause, fix_steps } = body;

    const MIRO_SERVICE_URL =
      process.env.MIRO_SERVICE_URL || "http://localhost:3015";

    const response = await fetch(`${MIRO_SERVICE_URL}/create-board`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: incident_id,
        title,
        description,
        root_cause,
        fix_steps,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Miro Service Error: ${errorText}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[Miro Proxy] Error:", error);
    return NextResponse.json(
      { error: "Failed to connect to Miro service" },
      { status: 500 },
    );
  }
}
