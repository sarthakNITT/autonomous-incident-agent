const PORT = process.env.PORT || 3015;
const MIRO_CLIENT_ID = process.env.MIRO_CLIENT_ID;
const MIRO_CLIENT_SECRET = process.env.MIRO_CLIENT_SECRET;
const MIRO_ACCESS_TOKEN = process.env.MIRO_ACCESS_TOKEN || "";
const MIRO_REDIRECT_URI =
  process.env.MIRO_REDIRECT_URI || `http://localhost:${PORT}/oauth/callback`;
const MIRO_DEFAULT_BOARD_ID = process.env.MIRO_DEFAULT_BOARD_ID;

async function miroRequest(path: string, method = "GET", body?: any) {
  const token = MIRO_ACCESS_TOKEN;
  if (!token) throw new Error("MIRO_ACCESS_TOKEN not set");

  const res = await fetch(`https://api.miro.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Miro API error ${res.status}: ${err}`);
  }

  return res.json();
}

async function addIncidentToBoard(incident: {
  id: string;
  title: string;
  description: string;
  stack_trace?: string;
  root_cause?: string;
  fix_steps?: string[];
}) {
  const boardId = MIRO_DEFAULT_BOARD_ID;
  const baseX = Math.floor(Math.random() * 2000) - 1000;
  const baseY = Math.floor(Math.random() * 2000) - 1000;

  const stickies = [
    {
      data: {
        content: `� <strong>${incident.title}</strong><br/>ID: ${incident.id}<br/>${incident.description}`,
        shape: "rectangle",
      },
      style: { fillColor: "light_yellow", textAlign: "left" },
      position: { x: baseX, y: baseY, origin: "center" },
      geometry: { width: 300 },
    },
    ...(incident.root_cause
      ? [
          {
            data: {
              content: `� <strong>Root Cause</strong><br/>${incident.root_cause}`,
              shape: "rectangle",
            },
            style: { fillColor: "light_yellow", textAlign: "left" },
            position: { x: baseX + 350, y: baseY, origin: "center" },
            geometry: { width: 300 },
          },
        ]
      : []),
    ...(incident.fix_steps?.length
      ? [
          {
            data: {
              content: `🔧 <strong>Fix Steps</strong><br/>${incident.fix_steps.map((s, i) => `${i + 1}. ${s}`).join("<br/>")}`,
              shape: "rectangle",
            },
            style: { fillColor: "light_yellow", textAlign: "left" },
            position: { x: baseX + 700, y: baseY, origin: "center" },
            geometry: { width: 300 },
          },
        ]
      : []),
  ];

  const created = [];
  for (const sticky of stickies) {
    const result = await miroRequest(
      `/v2/boards/${boardId}/sticky_notes`,
      "POST",
      sticky,
    );
    created.push(result.id);
  }

  return {
    board_id: boardId,
    board_url: `https://miro.com/app/board/${boardId}/`,
    items_created: created.length,
  };
}

async function addArchitectureDiagram() {
  const boardId = MIRO_DEFAULT_BOARD_ID;
  const services = [
    { name: "Web Dashboard (Next.js)", x: 0, y: -400 },
    { name: "Router (Incident Ingestion)", x: 0, y: -200 },
    { name: "State Service (PostgreSQL)", x: -400, y: 0 },
    { name: "Autopsy (You.com AI)", x: 0, y: 0 },
    { name: "Voice Agent (Deepgram)", x: 400, y: 0 },
    { name: "Runtime Monitor", x: -400, y: 200 },
    { name: "Security Scanner", x: 0, y: 200 },
    { name: "Notifications (Slack/Discord)", x: 400, y: 200 },
    { name: "Analytics", x: -200, y: 400 },
    { name: "Miro Integration", x: 200, y: 400 },
  ];

  const created = [];
  for (const s of services) {
    const result = await miroRequest(
      `/v2/boards/${boardId}/sticky_notes`,
      "POST",
      {
        data: { content: s.name, shape: "rectangle" },
        style: { fillColor: "#f5f5f5" },
        position: { x: s.x + 3000, y: s.y, origin: "center" },
        geometry: { width: 200 },
      },
    );
    created.push(result.id);
  }

  return {
    board_id: boardId,
    board_url: `https://miro.com/app/board/${boardId}/`,
    items_created: created.length,
  };
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === "GET" && url.pathname === "/health") {
      return new Response(
        JSON.stringify({
          status: "healthy",
          service: "miro-integration",
          token_set: !!MIRO_ACCESS_TOKEN,
          board_id: MIRO_DEFAULT_BOARD_ID,
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    if (req.method === "GET" && url.pathname === "/oauth/authorize") {
      const authUrl = `https://miro.com/oauth/authorize?response_type=code&client_id=${MIRO_CLIENT_ID}&redirect_uri=${encodeURIComponent(MIRO_REDIRECT_URI)}`;
      return new Response(null, {
        status: 302,
        headers: { Location: authUrl },
      });
    }

    if (req.method === "GET" && url.pathname === "/oauth/callback") {
      const code = url.searchParams.get("code");
      if (!code) return new Response("Missing code", { status: 400 });

      const tokenRes = await fetch("https://api.miro.com/v1/oauth/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${btoa(`${MIRO_CLIENT_ID}:${MIRO_CLIENT_SECRET}`)}`,
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          code,
          redirect_uri: MIRO_REDIRECT_URI,
        }),
      });

      const tokenData = await tokenRes.json();
      return new Response(
        JSON.stringify({
          success: true,
          access_token: tokenData.access_token,
          message: "Save this as MIRO_ACCESS_TOKEN",
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    if (req.method === "POST" && url.pathname === "/create-board") {
      try {
        const payload = await req.json();
        const result = await addIncidentToBoard(payload);
        return new Response(JSON.stringify({ success: true, ...result }), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    if (req.method === "POST" && url.pathname === "/visualize-architecture") {
      try {
        const result = await addArchitectureDiagram();
        return new Response(JSON.stringify({ success: true, ...result }), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    if (req.method === "GET" && url.pathname === "/boards") {
      try {
        const data = await miroRequest("/v2/boards");
        return new Response(JSON.stringify(data), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (error: any) {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`[Miro Integration] Running on http://localhost:${PORT}`);
console.log(
  `[Miro Integration] Board: https://miro.com/app/board/${MIRO_DEFAULT_BOARD_ID}/`,
);
console.log(
  `[Miro Integration] Token: ${MIRO_ACCESS_TOKEN ? "✅ Set" : "❌ Missing"}`,
);
