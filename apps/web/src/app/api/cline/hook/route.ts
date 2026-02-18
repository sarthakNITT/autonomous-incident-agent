import { NextRequest, NextResponse } from "next/server";

const CLINE_HOOK_TEMPLATES = {
  post_save: {
    name: "AIA Post-Save Incident Hook",
    description:
      "Automatically validates and formats incident patches when saved",
    trigger: "onFileSave",
    clineInstructions: `When a file matching the incident patch is saved:
1. Run the linter on the changed file
2. Check for common error patterns from the incident root cause
3. Suggest additional fixes if similar patterns are found
4. Update the incident status to "validating"`,
  },

  context_sync: {
    name: "AIA Incident Context Sync",
    description:
      "Loads full incident context (root cause, stack trace, patch) into Cline",
    trigger: "onTaskStart",
    clineInstructions: `At the start of every Cline task in this workspace:
1. Check if there are active AIA incidents via GET /api/incidents
2. If yes, prepend incident context to your system prompt
3. Highlight files mentioned in stack traces
4. Suggest fixes based on the root cause analysis`,
  },

  auto_pr: {
    name: "AIA Auto-PR After Fix",
    description:
      "Automatically creates a GitHub PR after Cline applies an incident fix",
    trigger: "onTaskComplete",
    clineInstructions: `After completing an incident fix task:
1. Stage all changed files: git add -A
2. Create a commit: git commit -m "fix: [AIA] <incident_title>"
3. Push to a new branch: git push origin fix/aia-<incident_id>
4. Notify AIA via POST /api/incidents/<id>/resolved`,
  },
};

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const hookType = url.searchParams.get("hook") || "all";
  const incidentId = url.searchParams.get("incident_id");

  if (hookType === "all") {
    return NextResponse.json({
      service: "cline-integration",
      description:
        "AIA custom Cline hooks and workflows for automated incident response",
      available_hooks: Object.keys(CLINE_HOOK_TEMPLATES),
      usage: "GET /api/cline/hook?hook=post_save&incident_id=<id>",
      cline_extension:
        "https://marketplace.visualstudio.com/items?itemName=saoudrizwan.claude-dev",
    });
  }

  const template =
    CLINE_HOOK_TEMPLATES[hookType as keyof typeof CLINE_HOOK_TEMPLATES];
  if (!template) {
    return NextResponse.json(
      { error: `Unknown hook type: ${hookType}` },
      { status: 400 },
    );
  }

  let incidentContext = "";
  if (incidentId) {
    try {
      const STATE_URL =
        process.env.STATE_SERVICE_URL || "http://localhost:3002";
      const res = await fetch(`${STATE_URL}/incidents/${incidentId}`);
      if (res.ok) {
        const incident = await res.json();
        incidentContext = `\n\nActive Incident Context:\n- ID: ${incident.id}\n- Title: ${incident.title}\n- Root Cause: ${incident.autopsy?.root_cause_text || "Analyzing..."}\n- Status: ${incident.status}`;
      }
    } catch {}
  }

  const hookConfig = {
    ...template,
    clineInstructions: template.clineInstructions + incidentContext,
    generated_at: new Date().toISOString(),
    incident_id: incidentId || null,
    custom_instructions: buildClineCustomInstructions(hookType, incidentId),
    vscode_settings: buildVSCodeSettings(hookType),
  };

  return NextResponse.json(hookConfig);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { hook_type, incident_id, workspace_path } = body;

  if (!hook_type) {
    return NextResponse.json({ error: "hook_type required" }, { status: 400 });
  }

  const template =
    CLINE_HOOK_TEMPLATES[hook_type as keyof typeof CLINE_HOOK_TEMPLATES];
  if (!template) {
    return NextResponse.json(
      { error: `Unknown hook type: ${hook_type}` },
      { status: 400 },
    );
  }

  const workflow = {
    name: template.name,
    version: "1.0.0",
    trigger: template.trigger,
    workspace: workspace_path || process.cwd(),
    incident_id: incident_id || null,
    steps: buildWorkflowSteps(hook_type, incident_id),
    custom_instructions: buildClineCustomInstructions(hook_type, incident_id),
    created_at: new Date().toISOString(),
  };

  return NextResponse.json({
    success: true,
    workflow,
    install_instructions: [
      "1. Install Cline VS Code extension",
      "2. Open VS Code Settings (Cmd+,)",
      '3. Search for "Cline: Custom Instructions"',
      "4. Paste the custom_instructions value",
      "5. The hook will activate automatically on the configured trigger",
    ],
  });
}

function buildClineCustomInstructions(
  hookType: string,
  incidentId?: string | null,
): string {
  const base = `You are integrated with AIA (Autonomous Incident Agent).
AIA API is available at: ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}
Active incident: ${incidentId || "none"}

`;

  const hooks: Record<string, string> = {
    post_save:
      base +
      `After every file save, check if the saved file is related to an AIA incident.
If it is, run: curl -X POST ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/incidents/${incidentId}/validate
Then report the validation result to the user.`,

    context_sync:
      base +
      `Before starting any task, fetch active incidents:
curl ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/incidents
Include the incident context in your analysis and prioritize fixing active incidents.`,

    auto_pr:
      base +
      `After completing a fix, automatically:
1. git add -A && git commit -m "fix: [AIA-${incidentId || "XXX"}] <description>"
2. git push origin fix/aia-${incidentId || "incident"}
3. curl -X POST ${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/incidents/${incidentId}/resolved`,
  };

  return hooks[hookType] || base;
}

function buildWorkflowSteps(hookType: string, incidentId?: string | null) {
  const steps: Record<string, object[]> = {
    post_save: [
      {
        step: 1,
        action: "detect_saved_file",
        description: "Identify which file was saved",
      },
      {
        step: 2,
        action: "match_incident",
        description: "Check if file matches active incident",
      },
      { step: 3, action: "run_linter", command: "bun run lint --fix" },
      {
        step: 4,
        action: "validate_patch",
        api: `/api/incidents/${incidentId}/validate`,
      },
      {
        step: 5,
        action: "report_result",
        description: "Show validation result to user",
      },
    ],
    context_sync: [
      { step: 1, action: "fetch_incidents", api: "/api/incidents" },
      {
        step: 2,
        action: "load_context",
        description: "Load incident into Cline context",
      },
      {
        step: 3,
        action: "highlight_files",
        description: "Mark incident-related files",
      },
    ],
    auto_pr: [
      { step: 1, action: "stage_changes", command: "git add -A" },
      {
        step: 2,
        action: "commit",
        command: `git commit -m "fix: [AIA-${incidentId}]"`,
      },
      {
        step: 3,
        action: "push",
        command: `git push origin fix/aia-${incidentId}`,
      },
      {
        step: 4,
        action: "notify_aia",
        api: `/api/incidents/${incidentId}/resolved`,
      },
    ],
  };

  return steps[hookType] || [];
}

function buildVSCodeSettings(hookType: string) {
  return {
    "cline.customInstructions": `AIA Hook: ${hookType} - See /api/cline/hook?hook=${hookType}`,
    "cline.alwaysAllowReadOnly": true,
    "cline.alwaysAllowWrite": false,
  };
}
