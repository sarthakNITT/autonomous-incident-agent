import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const {
      incident_id,
      title,
      root_cause,
      stack_trace,
      patch_diff,
      manual_steps,
    } = await req.json();

    if (!incident_id || !title) {
      return NextResponse.json(
        { error: "incident_id and title required" },
        { status: 400 },
      );
    }

    const kiloPrompt = buildKiloPrompt({
      incident_id,
      title,
      root_cause,
      stack_trace,
      patch_diff,
      manual_steps,
    });

    const encodedPrompt = encodeURIComponent(kiloPrompt);
    const vsCodeDeepLink = `vscode://kilo-technologies.kilo-code/newTask?prompt=${encodedPrompt}`;

    const kiloCliCommand = `kilo ask "${kiloPrompt.replace(/"/g, '\\"').slice(0, 200)}..."`;

    return NextResponse.json({
      success: true,
      incident_id,
      kilo_prompt: kiloPrompt,
      vscode_deep_link: vsCodeDeepLink,
      cli_command: kiloCliCommand,
      instructions: {
        vscode:
          "Click the VS Code link to open Kilo with this incident context pre-loaded",
        cli: "Run the CLI command in your terminal with Kilo CLI installed",
        manual: "Copy the prompt and paste it into Kilo in VS Code",
      },
    });
  } catch (error) {
    console.error("[Kilo] Error generating prompt:", error);
    return NextResponse.json(
      { error: "Failed to generate Kilo prompt" },
      { status: 500 },
    );
  }
}

function buildKiloPrompt(incident: {
  incident_id: string;
  title: string;
  root_cause?: string;
  stack_trace?: string;
  patch_diff?: string;
  manual_steps?: string[];
}): string {
  const sections: string[] = [];

  sections.push(`# AIA Incident Fix Request`);
  sections.push(
    `**Incident:** ${incident.title} (ID: ${incident.incident_id})`,
  );
  sections.push(``);

  if (incident.root_cause) {
    sections.push(`## Root Cause`);
    sections.push(incident.root_cause);
    sections.push(``);
  }

  if (incident.stack_trace) {
    sections.push(`## Stack Trace`);
    sections.push("```");
    sections.push(incident.stack_trace.slice(0, 1000));
    sections.push("```");
    sections.push(``);
  }

  if (incident.patch_diff) {
    sections.push(`## Suggested Patch`);
    sections.push("```diff");
    sections.push(incident.patch_diff);
    sections.push("```");
    sections.push(``);
  }

  if (incident.manual_steps?.length) {
    sections.push(`## Manual Fix Steps`);
    incident.manual_steps.forEach((step, i) => {
      sections.push(`${i + 1}. ${step}`);
    });
    sections.push(``);
  }

  sections.push(`## Your Task`);
  sections.push(
    `Please analyze this incident and help me implement the fix. Review the root cause, understand the stack trace, and apply the suggested patch or guide me through the manual steps. Make sure the fix is production-safe and includes appropriate error handling.`,
  );

  return sections.join("\n");
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const incident_id = url.searchParams.get("incident_id");

  if (!incident_id) {
    return NextResponse.json({
      service: "kilo-integration",
      description: "Generates Kilo AI prompts for incident fixes",
      usage: "POST /api/kilo/prompt with incident details",
      kilo_extension:
        "https://marketplace.visualstudio.com/items?itemName=kilo-technologies.kilo-code",
    });
  }

  try {
    const STATE_URL = process.env.STATE_SERVICE_URL || "http://localhost:3002";
    const res = await fetch(`${STATE_URL}/incidents/${incident_id}`);
    const incident = await res.json();

    const kiloPrompt = buildKiloPrompt({
      incident_id,
      title: incident.title || "Unknown Incident",
      root_cause: incident.root_cause,
      stack_trace: incident.stack_trace,
      patch_diff: incident.patch_diff,
      manual_steps: incident.manual_steps,
    });

    const encodedPrompt = encodeURIComponent(kiloPrompt);
    const vsCodeDeepLink = `vscode://kilo-technologies.kilo-code/newTask?prompt=${encodedPrompt}`;

    return NextResponse.json({
      success: true,
      incident_id,
      kilo_prompt: kiloPrompt,
      vscode_deep_link: vsCodeDeepLink,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch incident" },
      { status: 500 },
    );
  }
}
