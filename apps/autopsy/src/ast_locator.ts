import { join, isAbsolute, relative } from "path";

export class AstLocator {
  constructor(private repoRoot: string) {}

  async locateSource(
    stacktrace: string,
  ): Promise<{ path: string; line: number; relPath: string }[]> {
    const locations: { path: string; line: number; relPath: string }[] = [];

    const lines = stacktrace.split("\n");
    for (const line of lines) {
      const match = line.match(/(?:\(|^|\s)([^()\n]+):(\d+):(\d+)(?:\)|$)/);
      if (match) {
        let rawPath = match[1];
        const lineNumber = parseInt(match[2], 10);

        rawPath = rawPath.trim();
        if (rawPath.startsWith("at ")) {
          rawPath = rawPath.substring(3).trim();
        }

        let resolvedPath = "";
        let relPath = "";

        if (isAbsolute(rawPath)) {
          if (rawPath.startsWith("/app/")) {
            relPath = rawPath.replace("/app/", "");
          } else {
            relPath = relative(this.repoRoot, rawPath);
          }
        } else {
          relPath = rawPath;
        }

        const candidate = join(this.repoRoot, relPath);
        const exists = await Bun.file(candidate).exists();
        console.log(
          `[AstLocator] Raw: "${rawPath}" -> Candidate: "${candidate}" (Exists: ${exists})`,
        );

        if (exists) {
          locations.push({ path: candidate, line: lineNumber, relPath });
        } else {
        }
      }
    }

    const unique = [];
    const seen = new Set();
    for (const loc of locations) {
      if (!seen.has(loc.path + loc.line)) {
        seen.add(loc.path + loc.line);
        unique.push(loc);
      }
    }
    return unique;
  }

  async readContext(path: string, line: number, window = 20): Promise<string> {
    const file = Bun.file(path);
    if (!(await file.exists())) return "";
    const text = await file.text();
    const lines = text.split("\n");
    const start = Math.max(0, line - 1 - window);
    const end = Math.min(lines.length, line - 1 + window + 1);
    return lines.slice(start, end).join("\n");
  }
}
