import { createClient, LiveTranscriptionEvents } from "@deepgram/sdk";

const PORT = process.env.PORT || 3010;
const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY || "";
const STATE_SERVICE_URL =
  process.env.STATE_SERVICE_URL || "http://localhost:3002";

async function processVoiceCommand(command: string): Promise<any> {
  const lower = command.toLowerCase();

  try {
    if (
      lower.includes("list") ||
      (lower.includes("show") && lower.includes("incident"))
    ) {
      const res = await fetch(`${STATE_SERVICE_URL}/incidents`);
      const data = await res.json();
      const incidents = data.incidents || data || [];
      return {
        action: "list_incidents",
        count: incidents.length,
        incidents: incidents.slice(0, 5),
      };
    }

    if (lower.includes("critical")) {
      const res = await fetch(`${STATE_SERVICE_URL}/incidents`);
      const data = await res.json();
      const incidents = (data.incidents || data || []).filter(
        (i: any) => i.severity === "critical",
      );
      return {
        action: "critical_incidents",
        count: incidents.length,
        incidents,
      };
    }

    if (lower.includes("status") || lower.includes("summary")) {
      const res = await fetch(`${STATE_SERVICE_URL}/incidents`);
      const data = await res.json();
      const incidents = data.incidents || data || [];
      const resolved = incidents.filter(
        (i: any) => i.status === "resolved",
      ).length;
      const open = incidents.filter((i: any) => i.status !== "resolved").length;
      return {
        action: "status_summary",
        total: incidents.length,
        resolved,
        open,
      };
    }

    if (lower.includes("latest") || lower.includes("recent")) {
      const res = await fetch(`${STATE_SERVICE_URL}/incidents`);
      const data = await res.json();
      const incidents = data.incidents || data || [];
      const latest = incidents[0];
      return { action: "latest_incident", incident: latest };
    }

    return {
      action: "unknown",
      message:
        "Command not recognized. Try: list incidents, show critical, status summary, latest incident.",
    };
  } catch (error) {
    console.error("[Voice Agent] Command processing error:", error);
    return { action: "error", message: "Failed to process command" };
  }
}

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === "GET" && url.pathname === "/health") {
      return new Response(
        JSON.stringify({
          status: "healthy",
          service: "voice-agent",
          deepgram: !!DEEPGRAM_API_KEY,
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    if (req.method === "POST" && url.pathname === "/transcribe") {
      try {
        if (!DEEPGRAM_API_KEY) {
          return new Response(
            JSON.stringify({ error: "DEEPGRAM_API_KEY not set" }),
            {
              status: 500,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        const body = await req.json();
        const { audio_url, text } = body;

        if (text) {
          const result = await processVoiceCommand(text);
          return new Response(
            JSON.stringify({ transcript: text, command_result: result }),
            {
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        if (audio_url) {
          const deepgram = createClient(DEEPGRAM_API_KEY);
          const { result, error } =
            await deepgram.listen.prerecorded.transcribeUrl(
              { url: audio_url },
              { model: "nova-2", smart_format: true, language: "en" },
            );

          if (error) throw error;

          const transcript =
            result?.results?.channels?.[0]?.alternatives?.[0]?.transcript || "";
          const commandResult = await processVoiceCommand(transcript);

          return new Response(
            JSON.stringify({
              transcript,
              confidence:
                result?.results?.channels?.[0]?.alternatives?.[0]?.confidence,
              command_result: commandResult,
            }),
            { headers: { "Content-Type": "application/json" } },
          );
        }

        return new Response(
          JSON.stringify({ error: "Provide audio_url or text" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      } catch (error) {
        console.error("[Voice Agent] Transcription error:", error);
        return new Response(JSON.stringify({ error: "Transcription failed" }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    if (req.method === "POST" && url.pathname === "/command") {
      try {
        const { command } = await req.json();
        if (!command) return new Response("Command required", { status: 400 });
        const result = await processVoiceCommand(command);
        return new Response(JSON.stringify(result), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (error) {
        return new Response("Failed", { status: 500 });
      }
    }

    if (req.method === "GET" && url.pathname === "/ws-info") {
      return new Response(
        JSON.stringify({
          info: "Connect to Deepgram WebSocket for live transcription",
          deepgram_ws: "wss://api.deepgram.com/v1/listen",
          model: "nova-2",
          docs: "https://developers.deepgram.com/docs/getting-started-with-live-streaming-audio",
        }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`[Voice Agent] Service running on http://localhost:${PORT}`);
console.log(
  `[Voice Agent] Deepgram API Key: ${DEEPGRAM_API_KEY ? "✅ Set" : "❌ Missing"}`,
);
