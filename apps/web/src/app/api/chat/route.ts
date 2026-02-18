import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const YOU_API_KEY = process.env.YOU_API_KEY;

    if (!YOU_API_KEY) {
      return NextResponse.json(
        { error: "YOU_API_KEY not configured" },
        { status: 500 },
      );
    }

    const systemPrompt = `You are an expert DevOps and incident management AI assistant for AIA (Autonomous Incident Agent). 
You help developers understand and resolve software incidents, deployment failures, runtime errors, and security vulnerabilities.
You provide concise, actionable advice. When discussing code fixes, provide specific examples.
You have knowledge of the AIA system which automatically detects incidents, analyzes root causes using AI, and suggests fixes.`;

    const response = await fetch("https://api.ydc-index.io/rag", {
      method: "POST",
      headers: {
        "X-API-Key": YOU_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: message,
        instructions: systemPrompt,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[Chat] You.com API error:", errorText);

      const fallbackResponse = generateFallbackResponse(message);
      return NextResponse.json({ response: fallbackResponse });
    }

    const data = await response.json();

    const answer =
      data.answer ||
      data.response ||
      (data.hits && data.hits[0]?.snippets?.join("\n\n")) ||
      "I couldn't find a specific answer. Please try rephrasing your question.";

    return NextResponse.json({ response: answer });
  } catch (error) {
    console.error("[Chat] Error:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 },
    );
  }
}

function generateFallbackResponse(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("null pointer") || lower.includes("nullpointer")) {
    return `**Null Pointer Exception Fix:**

1. **Check for null before use:**
\`\`\`javascript
if (obj !== null && obj !== undefined) {
  obj.method();
}
\`\`\`

2. **Use optional chaining:**
\`\`\`javascript
const value = obj?.property?.nested;
\`\`\`

3. **Provide default values:**
\`\`\`javascript
const name = user?.name ?? 'Unknown';
\`\`\`

**Root Cause:** Usually happens when an object is not initialized before use or an API returns null unexpectedly.`;
  }

  if (lower.includes("deployment") || lower.includes("deploy")) {
    return `**Common Deployment Failure Causes:**

1. **Missing environment variables** - Check all required env vars are set
2. **Build errors** - Run \`bun run build\` locally first
3. **Port conflicts** - Ensure correct PORT is configured
4. **Database connection** - Verify DATABASE_URL is correct
5. **Memory limits** - Check if service has enough RAM

**Quick Fix:**
- Check deployment logs for specific error
- Verify all environment variables in your platform dashboard
- Test build locally before deploying`;
  }

  if (lower.includes("critical") || lower.includes("incident")) {
    return `**Handling Critical Incidents:**

1. **Immediate:** Check the incident details in your AIA dashboard
2. **Analyze:** Review the AI-generated root cause analysis
3. **Fix:** Apply the suggested patch or follow manual steps
4. **Notify:** Team has been alerted via Slack/Discord
5. **Resolve:** Mark incident as resolved after fix is deployed

AIA automatically handles detection → analysis → fix suggestion → notification pipeline for you!`;
  }

  return `I'm your AI incident assistant powered by You.com. I can help you with:

- 🔍 **Understanding incidents** and their root causes
- 🔧 **Fix suggestions** for common errors
- 📊 **Best practices** for incident management
- 🚀 **Deployment troubleshooting**
- 🔐 **Security vulnerability guidance**

Please ask me a specific question about your incident or error!`;
}
