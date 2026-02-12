import { spawn } from "child_process";
import { existsSync, mkdirSync, rmSync } from "fs";
import { join } from "path";

export class RepoManager {
  constructor(private workDir: string) {
    if (!existsSync(workDir)) {
      mkdirSync(workDir, { recursive: true });
    }
  }

  async clone(repoUrl: string, targetName: string): Promise<string> {
    const targetPath = join(this.workDir, targetName);

    if (existsSync(targetPath)) {
      rmSync(targetPath, { recursive: true, force: true });
    }

    await this.runGit(["clone", repoUrl, targetName], this.workDir);
    return targetPath;
  }

  async checkout(repoPath: string, branch: string, create = false) {
    if (create) {
      await this.runGit(["checkout", "-b", branch], repoPath);
    } else {
      await this.runGit(["checkout", branch], repoPath);
    }
  }

  async configUser(repoPath: string, name: string, email: string) {
    await this.runGit(["config", "user.name", name], repoPath);
    await this.runGit(["config", "user.email", email], repoPath);
  }

  async applyPatch(repoPath: string, patchContent: string) {
    const patchFile = join(repoPath, "temp.patch");
    await Bun.write(patchFile, patchContent);

    try {
      // Use robust flags to handle AI generated whitespace inconsistencies
      await this.runGit(
        ["apply", "--ignore-space-change", "--ignore-whitespace", "temp.patch"],
        repoPath,
      );
    } catch (e) {
      console.error(
        "Apply patch failed, check logs for corrupt patch details.",
      );
      throw e;
    } finally {
      if (existsSync(patchFile)) {
        rmSync(patchFile);
      }
    }
  }

  async add(repoPath: string, files: string[]) {
    await this.runGit(["add", ...files], repoPath);
  }

  async commit(repoPath: string, message: string) {
    await this.runGit(["commit", "-m", message], repoPath);
  }

  async push(repoPath: string, branch: string, remote = "origin") {
    await this.runGit(["push", "-u", remote, branch], repoPath);
  }

  private async runGit(args: string[], cwd: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = spawn("git", args, { cwd, stdio: "inherit" });
      proc.on("close", (code) => {
        if (code === 0) resolve();
        else
          reject(
            new Error(
              `Git command failed: git ${args.join(" ")} (code ${code})`,
            ),
          );
      });
    });
  }
}
