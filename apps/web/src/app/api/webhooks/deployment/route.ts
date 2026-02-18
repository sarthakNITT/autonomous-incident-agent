import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const source = req.headers.get("x-deployment-source") || "unknown";

    let projectId: string | null = null;
    let deploymentStatus: string | null = null;
    let errorLogs: string | null = null;
    let deploymentUrl: string | null = null;

    if (source === "vercel" || payload.type === "deployment") {
      const deployment = payload.deployment || payload;
      deploymentStatus = deployment.state || deployment.status;
      projectId = deployment.meta?.projectId || deployment.projectId;
      errorLogs = deployment.errorMessage || "Deployment failed";
      deploymentUrl = deployment.url;

      if (deploymentStatus !== "ERROR" && deploymentStatus !== "FAILED") {
        return NextResponse.json({ message: "Deployment succeeded" });
      }
    }

    if (payload.deployment_status || payload.deployment) {
      const status = payload.deployment_status || payload;
      deploymentStatus = status.state;
      projectId = payload.repository?.id?.toString();
      errorLogs = status.description || "GitHub Pages deployment failed";
      deploymentUrl = status.target_url || payload.repository?.html_url;

      if (deploymentStatus !== "error" && deploymentStatus !== "failure") {
        return NextResponse.json({ message: "Deployment succeeded" });
      }
    }

    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID not found in webhook payload" },
        { status: 400 },
      );
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3003";
    await axios.post(`${apiUrl}/incidents/deployment-failure`, {
      projectId,
      source,
      status: deploymentStatus,
      errorLogs,
      deploymentUrl,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      message: "Deployment failure processed",
      projectId,
    });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 },
    );
  }
}
