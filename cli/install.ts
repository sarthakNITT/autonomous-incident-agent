import { join } from "path";

async function prompt(question: string): Promise<string> {
  process.stdout.write(question + " ");
  for await (const line of console) {
    return line.trim();
  }
  return "";
}

async function main() {
  console.log("=== AIA Automated Installer ===\n");
  console.log("This script will generate a 'aia.config.yaml' for you.");

  const project_name = (await prompt("Project Name [aia-demo]:")) || "aia-demo";
  const bucket = (await prompt("R2 Bucket Name:")) || "my-bucket";
  const access_key = (await prompt("R2 Access Key:")) || "";
  const secret_key = (await prompt("R2 Secret Key:")) || "";
  const endpoint = (await prompt("R2 Endpoint:")) || "";
  const github_token = (await prompt("GitHub Token:")) || "";
  const ai_key = (await prompt("You.com API Key:")) || "";

  const configContent = `
project_name: "${project_name}"
cluster_env: "prod"

services:
  dashboard: { port: 3000, base_url: "http://localhost:3000" }
  router: { port: 3001, base_url: "http://localhost:3001" }
  autopsy: { port: 3002, base_url: "http://localhost:3002" }
  state: { port: 3003, base_url: "http://localhost:3003" }
  git: { port: 3004, base_url: "http://localhost:3004" }
  repro: { port: 3005, base_url: "http://localhost:3005" }
  web: { port: 3006, base_url: "http://localhost:3006" }
  docs: { port: 3007, base_url: "http://localhost:3007" }
  sample_app: { port: 3008, base_url: "http://localhost:3008" }
  web_backup: { port: 3009, base_url: "http://localhost:3009" }
  agent: { port: 4318, base_url: "http://localhost:4318" }

paths:
  repo_root: "${process.cwd()}"
  logs: "logs/app.log"
  events: "events"
  storage: "storage"
  autopsy_output: "autopsy_output"
  patches: "patches"
  pr_description: "pr_descriptions"
  repro_logs: "repro_logs"
  reports: "dashboard/reports" 

storage:
  provider: "r2"
  bucket: "${bucket}"
  access_key: "${access_key}"
  secret_key: "${secret_key}"
  region: "auto"
  endpoint: "${endpoint}"

github:
  provider: "github"
  token: "${github_token}"
  owner: "sarthakNITT"
  repo: "autonomous-incident-agent"
  base_branch: "main"

ai:
  provider: "you.com"
  api_key: "${ai_key}"
  model: "research"

database:
  provider: "sqlite"
  path: "${join(process.cwd(), "aira.db")}"
`;

  const targetPath = join(process.cwd(), "aia.config.yaml");
  await Bun.write(targetPath, configContent);

  console.log(`\nConfiguration written to ${targetPath}`);
  console.log("\nNext Steps:");
  console.log(
    "1. Run 'bun run apps/docs/src/server.ts' to view documentation.",
  );
  console.log("2. Start services as needed.");
}

main();
