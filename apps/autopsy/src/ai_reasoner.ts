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
   CRITICAL PATCH FORMAT REQUIREMENTS:
   - The patch MUST start with exactly: --- a/${req.file_context[0]?.path || "unknown"}
   - Followed by exactly: +++ b/${req.file_context[0]?.path || "unknown"}
   - Then the hunk header: @@ -startLine,lineCount +startLine,lineCount @@
   - Include at least 3 lines of unchanged context BEFORE the change
   - Include at least 3 lines of unchanged context AFTER the change
   - Unchanged lines start with a space character
   - Removed lines start with a minus sign (-)
   - Added lines start with a plus sign (+)
   - DO NOT include any markdown formatting, code blocks, or explanatory text
   - The patch must be a valid git diff that can be applied with 'git apply'
3. Provide a deterministic test case (TypeScript) to reproduce and verify the fix.
4. Estimate confidence score (0-1).
5. Provide a "fix_prompt" (string): A comprehensive, detailed prompt that includes:
   - The exact file path and line numbers where changes are needed
   - The complete error context and root cause
   - Specific code that needs to be changed (before and after)
   - Any additional context needed for an AI to make the exact fix
   This should be a complete, self-contained prompt ready to paste into an AI coding assistant.
6. Provide "manual_steps" (array of strings): Detailed step-by-step instructions including:
   - Exact file paths to open
   - Specific line numbers to navigate to
   - Precise code changes to make (with before/after examples)
   - Any testing or verification steps
   Each step should be actionable and specific.

Output JSON only. Do not include markdown code block syntax (no \`\`\`json). Just the raw JSON object string.
{
  "root_cause": "string",
  "patch": { "file_path": "${req.file_context[0]?.path || "string"}", "diff": "string (multiline diff)" },
  "test_code": "string",
  "confidence": number,
  "fix_prompt": "string (detailed, multi-line prompt with file paths, line numbers, and exact changes)",
  "manual_steps": ["Step 1: Open file X at line Y...", "Step 2: Change code from A to B...", "Step 3: Test by..."]
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

      let textFn = "";
      if (data.output && Array.isArray(data.output)) {
        const answer = data.output.find(
          (o: any) => o.type === "message.answer",
        );
        if (answer) textFn = answer.text;
      } else if (data.text) {
        textFn = data.text;
      }

      if (!textFn) {
        textFn = JSON.stringify(data);
      }

      let cleanJson = textFn
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      try {
        return JSON.parse(cleanJson);
      } catch (e) {
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
