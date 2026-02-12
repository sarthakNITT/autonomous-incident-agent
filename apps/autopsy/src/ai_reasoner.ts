import type { AiReasoningRequest, AiReasoningResponse } from "@repo/types";

export class YouComReasoner {
  constructor(
    private apiKey: string,
    private model: string,
  ) {}

  async analyze(req: AiReasoningRequest): Promise<AiReasoningResponse> {
    if (!this.apiKey || this.apiKey === "PLACEHOLDER") {
      throw new Error("No You.com API key provided. Mock mode is disabled.");
    }

    const contextStr = req.file_context
      .map((f) => `File: ${f.path}\nContent:\n${f.content}`)
      .join("\n---\n");
    // ... prompt construction ...
    const prompt = `
You are an expert software engineer. Analyze the following stacktrace and code context to identify the root cause of the error.
Error Message: ${req.error_message}
Stacktrace:
${req.stacktrace}

Code Context:
${contextStr}

Task:
1. Explain the root cause concisely.
2. Provide a valid Unified Diff patch to fix the issue.
   - The patch MUST start with '--- a/{file_path}' and '+++ b/{file_path}'.
   - The file path in the diff must match exactly: ${req.file_context[0]?.path || "unknown"}.
   - Include at least 4-5 lines of context (unchanged lines) around the changes.
   - Ensure typical git diff header format (@@ -start,count +start,count @@).
3. Provide a deterministic test case (TypeScript) to reproduce and verify the fix.
4. Estimate confidence score (0-1).

Output JSON only. Do not include markdown code block syntax (no \`\`\`json). Just the raw JSON object string.
{
  "root_cause": "string",
  "patch": { "file_path": "${req.file_context[0]?.path || "string"}", "diff": "string (multiline diff)" },
  "test_code": "string",
  "confidence": number
}
`;

    try {
      /*
       * Note: The previous implementation used https://api.you.com/v1/agents/runs
       * I will assume this is the correct endpoint for the user.
       */
      const response = await fetch("https://api.you.com/v1/agents/runs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": this.apiKey,
        },
        body: JSON.stringify({
          input: prompt,
          agent: "express",
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(
          `You.com API Error: ${response.status} ${response.statusText} - ${errText}`,
        );
      }

      const data = (await response.json()) as any;
      console.log(
        "[AI Reasoner] Raw response:",
        JSON.stringify(data).substring(0, 200),
      );

      // ... extraction logic ...
      let textFn = "";
      // The structure of You.com API response varies.
      // Usually it's in data.output or data.message
      if (data.output && Array.isArray(data.output)) {
        // ... logic from before ...
        const answer = data.output.find(
          (o: any) => o.type === "message.answer",
        );
        if (answer) textFn = answer.text;
      } else if (data.text) {
        textFn = data.text;
      }

      if (!textFn) {
        // Try to inspect the whole object if we missed it
        textFn = JSON.stringify(data);
        // throw new Error("No answer text found in You.com response");
      }

      // Clean up markdown code blocks if present
      let cleanJson = textFn
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      try {
        return JSON.parse(cleanJson);
      } catch (e) {
        // Fallback regex search
        const jsonMatch = textFn.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw new Error(
          `Could not parse JSON from AI response: ${textFn.substring(0, 100)}...`,
        );
      }
    } catch (e) {
      console.error("AI Reasoner failed:", e);
      throw e;
    }
  }
}
