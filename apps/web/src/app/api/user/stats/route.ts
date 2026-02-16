import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getUserStats } from "@/lib/user-sync";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getUserStats(userId);

    if (!stats) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
