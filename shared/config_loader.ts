import { Config } from "@repo/types";
import { readFileSync, existsSync } from "fs";
import { join, isAbsolute, dirname, resolve } from "path";
import yaml from "js-yaml";

let cachedConfig: Config | null = null;
const isDocker = existsSync("/.dockerenv") || process.env.BUN_ENV === "docker";

export function loadConfig(): Config {
  if (cachedConfig) return cachedConfig;

  const configPath =
    process.env.AIA_CONFIG_PATH ||
    join(__dirname, "../../config/aia.config.yaml");

  const possiblePaths = [
    process.env.AIA_CONFIG_PATH,
    // Local config takes priority (gitignored, for testing)
    join(process.cwd(), "aia.config.local.yaml"),
    join(process.cwd(), "../aia.config.local.yaml"),
    join(process.cwd(), "../../aia.config.local.yaml"),
    join(process.cwd(), "../../../aia.config.local.yaml"),
    join(process.cwd(), "config", "aia.config.local.yaml"),
    // Then check standard config locations
    join(process.cwd(), "config", "aia.config.yaml"),
    join(process.cwd(), "aia.config.yaml"),
    join(process.cwd(), "../aia.config.yaml"),
    join(process.cwd(), "../../aia.config.yaml"),
    join(process.cwd(), "../../../aia.config.yaml"),
    "/config/aia.config.yaml",
    "/app/config/aia.config.yaml",
  ].filter(Boolean) as string[];

  let loadedContent = "";
  let foundPath = "";

  for (const p of possiblePaths) {
    if (existsSync(p)) {
      loadedContent = readFileSync(p, "utf-8");
      foundPath = p;
      console.log(`[ConfigLoader] Loaded config from: ${foundPath}`);
      break;
    }
  }

  if (!loadedContent) {
    throw new Error(
      `Could not find aia.config.yaml in ${possiblePaths.join(", ")}`,
    );
  }

  const config = yaml.load(loadedContent) as Config;

  const rootDir = foundPath ? dirname(foundPath) : process.cwd();

  const envPath = join(rootDir, ".env");
  if (existsSync(envPath)) {
    const envContent = readFileSync(envPath, "utf-8");
    envContent.split("\n").forEach((line) => {
      const match = line.match(/^\s*([\w_]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || "";
        if (value.startsWith('"') && value.endsWith('"'))
          value = value.slice(1, -1);
        if (value.startsWith("'") && value.endsWith("'"))
          value = value.slice(1, -1);

        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
    console.log(`[ConfigLoader] Loaded and parsed .env from: ${envPath}`);
  }

  if (process.env.YOU_API_KEY) {
    if (!config.ai) {
      config.ai = { provider: "you.com", api_key: "", model: "research" };
    }
    console.log(
      `[ConfigLoader] Using YOU_API_KEY from env (Masked: ${process.env.YOU_API_KEY.substring(0, 5)}...)`,
    );
    config.ai.api_key = process.env.YOU_API_KEY;
    config.ai.provider = "you.com";
  }

  if (process.env.GITHUB_TOKEN) {
    if (!config.github) {
      config.github = {
        provider: "github",
        token: "",
        base_branch: "main",
        owner: "mock-owner",
        repo: "mock-repo",
        username: "aia-bot",
        email: "bot@aia.local",
      };
    }
    console.log(
      `[ConfigLoader] Using GITHUB_TOKEN from env (Masked: ${process.env.GITHUB_TOKEN.substring(0, 5)}...)`,
    );
    config.github.token = process.env.GITHUB_TOKEN;
    config.github.provider = "github";
  }

  if (process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY) {
    if (!config.storage) {
      config.storage = {
        provider: "r2",
        bucket: process.env.R2_BUCKET_NAME || "aia",
        access_key: "",
        secret_key: "",
        region: "auto",
        endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      };
    }
    config.storage.provider = "r2";
    config.storage.access_key = process.env.R2_ACCESS_KEY_ID;
    config.storage.secret_key = process.env.R2_SECRET_ACCESS_KEY;
    config.storage.endpoint = `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`;
  }

  if (!isDocker) {
    config.paths.repo_root = resolve(rootDir, config.paths.repo_root);
    config.paths.logs = resolve(rootDir, config.paths.logs);
    config.paths.events = resolve(rootDir, config.paths.events);
    config.paths.storage = resolve(rootDir, config.paths.storage);
    config.paths.autopsy_output = resolve(rootDir, config.paths.autopsy_output);
    config.paths.patches = resolve(rootDir, config.paths.patches);
    config.paths.pr_description = resolve(rootDir, config.paths.pr_description);
    config.paths.repro_logs = resolve(rootDir, config.paths.repro_logs);
    config.paths.reports = resolve(rootDir, config.paths.reports);

    if (!config.storage) {
      throw new Error(
        "Storage configuration missing in aia.config.yaml or .env",
      );
    }

    if (
      !config.ai ||
      !config.ai.api_key ||
      config.ai.api_key === "PLACEHOLDER"
    ) {
      if (!process.env.YOU_API_KEY) {
        throw new Error(
          "AI Configuration (YOU_API_KEY) missing. Mock mode is disabled.",
        );
      }
    }
  } else {
    config.paths.repo_root = "/app";
    config.paths.logs = "/logs/app.log";
    config.paths.events = "/events";
    config.paths.storage = "/storage";
    config.paths.autopsy_output = "/autopsy_output";
    config.paths.patches = "/patches";
    config.paths.reports = "/app/dashboard/reports";

    if (!config.storage) {
      throw new Error("Storage configuration missing.");
    }
    if (!config.ai || !config.ai.api_key) {
      throw new Error(
        "AI Configuration missing in Docker environment. Mock mode is disabled.",
      );
    }
  }

  if (process.env.PORT) {
  }

  if (
    !config.github ||
    !config.github.token ||
    config.github.token === "PLACEHOLDER"
  ) {
    if (!process.env.GITHUB_TOKEN) {
      throw new Error(
        "GitHub Configuration (GITHUB_TOKEN) missing. Mock mode is disabled.",
      );
    }
  }

  if (!config.services.git) {
    config.services.git = { port: 3004, base_url: "http://localhost:3004" };
  }

  if (!config.services.repro) {
    config.services.repro = { port: 3005, base_url: "http://localhost:3005" };
  }

  if (!config.services.state) {
    config.services.state = { port: 3003, base_url: "http://localhost:3003" };
  }

  if (!config.services.web) {
    config.services.web = { port: 3006, base_url: "http://localhost:3006" };
  }

  if (!config.services.docs) {
    config.services.docs = { port: 3007, base_url: "http://localhost:3007" };
  }

  if (!config.services.dashboard) {
    config.services.dashboard = {
      port: 3000,
      base_url: "http://localhost:3000",
    };
  }

  if (!config.services.sample_app) {
    config.services.sample_app = {
      port: 3008,
      base_url: "http://localhost:3008",
    };
  }

  if (!config.services.web_backup) {
    config.services.web_backup = {
      port: 3009,
      base_url: "http://localhost:3009",
    };
  }

  if (!config.services.agent) {
    config.services.agent = {
      port: 4318,
      base_url: "http://localhost:4318",
    };
  }

  if (!config.database) {
    config.database = {
      provider: "postgres",
      url: process.env.DATABASE_URL || "",
      path: "",
    };
  }

  cachedConfig = config;
  return config;
}
