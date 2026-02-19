import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;

    if (!audioFile) {
      return NextResponse.json(
        { error: "Audio file required" },
        { status: 400 },
      );
    }

    const VOICE_SERVICE_URL =
      process.env.VOICE_SERVICE_URL || "http://localhost:3010";

    const response = await fetch(`${VOICE_SERVICE_URL}/transcribe-audio`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { error: `Voice Service Error: ${errorText}` },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[Voice Proxy] Error:", error);
    return NextResponse.json(
      { error: "Failed to connect to Voice service" },
      { status: 500 },
    );
  }
}
