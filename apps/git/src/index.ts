import { loadConfig } from "../../../shared/config_loader";
import { R2Client } from "@repo/storage";
import { GitHubClient } from "./github_client";
import { RepoManager } from "./repo_manager";
import { join } from "path";
import type { PullRequestRequest } from "@repo/types";

const config = loadConfig();
const PORT = config.services.git.port;
const WORK_DIR = join(process.cwd(), "git_workspace");

const storage = new R2Client(config.storage);
const github = new GitHubClient(config.github);
const repoMgr = new RepoManager(WORK_DIR);

const server = Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);

    if (req.method === "POST" && url.pathname === "/pr") {
      try {
        const body = (await req.json()) as PullRequestRequest;
        console.log(
          `[Git] Received PR Request for incident ${body.incident_id}`,
        );

        const branchName = `aia/incident-${body.incident_id}`;
        const repoName = `repo-${body.incident_id}`;

        const githubUrl = `https://${config.github.token}@github.com/${config.github.owner}/${config.github.repo}.git`;
        console.log(
          `[Git] Cloning from GitHub: https://***@github.com/${config.github.owner}/${config.github.repo}.git`,
        );
        const repoPath = await repoMgr.clone(githubUrl, repoName);
        console.log(`[Git] Cloned into ${repoPath}`);
        try {
          const envContent = await Bun.file(
            join(config.paths.repo_root, ".env"),
          ).text();
          await Bun.write(join(repoPath, ".env"), envContent);
          console.log(`[Git] Copied .env to cloned workspace.`);
        } catch (e) {
          console.warn(
            `[Git] Failed to copy .env to workspace. Build might fail if env vars are needed.`,
            e,
          );
        }

        console.log(`[Git] Installing dependencies...`);
        await repoMgr.installDependencies(repoPath);

        console.log(`[Git] Checking out branch: ${branchName}`);
        await repoMgr.configUser(
          repoPath,
          config.github.username || "aia-bot",
          config.github.email || "bot@aia.local",
        );
        await repoMgr.checkout(repoPath, branchName, true);

        console.log(`[Git] Applying patches...`);
        for (const patch of body.patches) {
          try {
            await repoMgr.applyPatch(repoPath, patch.content);
          } catch (e) {
            console.warn(
              `[Git] Failed to apply patch for ${patch.path || "unknown"}:`,
              e,
            );
            const failedPatchName = `patch_failed_${Date.now()}.diff`;
            await Bun.write(join(repoPath, failedPatchName), patch.content);
            await repoMgr.add(repoPath, [failedPatchName]);
          }
        }

        for (const file of body.files) {
          const fullPath = join(repoPath, file.path);
          await Bun.write(fullPath, file.content);
        }

        console.log(`[Git] Committing changes...`);
        await repoMgr.add(repoPath, ["."]);
        await repoMgr.commit(
          repoPath,
          `fix: resolve incident ${body.incident_id}\n\n${body.title}`,
        );

        console.log(`[Git] Pushing changes to remote...`);
        await repoMgr.push(repoPath, branchName);

        console.log(`[Git] Creating Pull Request...`);
        const pr = await github.createPullRequest(
          body.title,
          body.body,
          branchName,
          config.github.base_branch,
        );

        fetch(
          `${config.services.state.base_url}/incidents/${body.incident_id}/update`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: "validating",
              pr_url: pr.url,
            }),
          },
        ).catch((e) => console.error("Failed to update state", e));

        console.log(`[Git] PR Created: ${pr.url}`);

        return new Response(JSON.stringify(pr), {
          headers: { "Content-Type": "application/json" },
        });
      } catch (e) {
        console.error("Git Service Error", e);
        return new Response(`Error: ${e}`, { status: 500 });
      }
    }

    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Git Service listening on http://localhost:${PORT}`);
