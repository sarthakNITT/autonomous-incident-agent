import { NextResponse } from "next/server";

export async function GET() {
  try {
    const STATE_URL = process.env.STATE_SERVICE_URL || "http://localhost:3002";
    const res = await fetch(`${STATE_URL}/incidents`, {
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json({ incidents: data.incidents || data || [] });
  } catch {
    return NextResponse.json({ incidents: [] });
  }
}
