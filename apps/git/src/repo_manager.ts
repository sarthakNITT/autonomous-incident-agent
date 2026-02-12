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

  async installDependencies(repoPath: string) {
    console.log(`[RepoManager] Installing dependencies in ${repoPath}`);
    // Default to bun install if bun.lockb exists, otherwise check for package-lock.json
    if (existsSync(join(repoPath, "bun.lockb"))) {
      // Attempt installation trusting scripts to avoid broken local bun
      try {
        await this.runCommand("bun", ["install", "--trust"], repoPath);
      } catch (e) {
        console.warn(
          "[RepoManager] bun install --trust failed, falling back to standard install",
          e,
        );
        await this.runCommand("bun", ["install"], repoPath);
      }

      // HACK: If node_modules/bun exists, it might be broken (missing postinstall run).
      // We remove it to force usage of global bun for any scripts that call 'bun'.
      const localBun = join(repoPath, "node_modules", "bun");
      if (existsSync(localBun)) {
        console.log(
          "[RepoManager] Removing potentially broken local 'bun' package to force global usage.",
        );
        await this.runCommand("rm", ["-rf", "node_modules/bun"], repoPath);
      }
    } else if (existsSync(join(repoPath, "package-lock.json"))) {
      await this.runCommand("npm", ["install"], repoPath);
    } else {
      // Default to bun install
      await this.runCommand("bun", ["install"], repoPath);
    }
  }

  async buildProject(repoPath: string, filter?: string) {
    console.log(`[RepoManager] Building project in ${repoPath}`);
    // If filter is provided, target specific package
    if (filter) {
      console.log(`[RepoManager] Applying build filter: ${filter}`);
      // Turbo supports --filter flag to run only specific package
      // However, the root script is likely `turbo run build`.
      // We can pass the filter to turbo.
      // If npm run build is used, it might be tricky.
      // Assuming turbo is used via `bun run build`.
      // We can directly call turbo if we had it, but `bun run build` is safer.
      // Let's assume `bun run build` just calls `turbo run build`.
      // We can append arguments? `bun run build -- --filter=${filter}`?
      // Let's try appending.
      await this.runCommand(
        "bun",
        ["run", "build", `--filter=${filter}`],
        repoPath,
      );
    } else {
      // Build ALL
      await this.runCommand("bun", ["run", "build"], repoPath);
    }
  }

  async runTests(repoPath: string) {
    console.log(`[RepoManager] Running tests in ${repoPath}`);
    await this.runCommand("bun", ["run", "test"], repoPath);
  }

  private async runCommand(
    command: string,
    args: string[],
    cwd: string,
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const proc = spawn(command, args, { cwd, stdio: "inherit" });
      proc.on("close", (code) => {
        if (code === 0) resolve();
        else
          reject(
            new Error(
              `${command} command failed: ${command} ${args.join(" ")} (code ${code})`,
            ),
          );
      });
    });
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
