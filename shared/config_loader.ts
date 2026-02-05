import { Config } from "@repo/types";
import { readFileSync, existsSync } from "fs";
import { join, isAbsolute } from "path";
import yaml from "js-yaml";

let cachedConfig: Config | null = null;
const isDocker = existsSync("/.dockerenv") || process.env.BUN_ENV === "docker";

export function loadConfig(): Config {
    if (cachedConfig) return cachedConfig;

    const configPath = process.env.AIA_CONFIG_PATH || join(__dirname, "../../config/aia.config.yaml");

    // In Docker, config might be at /app/config/aia.config.yaml or /config/aia.config.yaml
    // We try the standard relative path first (works if volume mounted to ./config)
    let possiblePaths = [
        configPath,
        "/config/aia.config.yaml",
        "/app/config/aia.config.yaml",
        join(process.cwd(), "config/aia.config.yaml")
    ];

    let loadedContent = "";
    let foundPath = "";

    for (const p of possiblePaths) {
        if (existsSync(p)) {
            loadedContent = readFileSync(p, "utf-8");
            foundPath = p;
            break;
        }
    }

    if (!loadedContent) {
        throw new Error(`Could not find aia.config.yaml in ${possiblePaths.join(", ")}`);
    }

    const config = yaml.load(loadedContent) as Config;

    // Resolve paths
    // If running in Docker, we often want absolute paths mapped to volumes.
    // If local, we want relative to repo root or absolute.

    // Helper to ensure absolute path relative to repo root if path is relative
    const rootDir = process.cwd(); // simplified repo root detection

    if (!isDocker) {
        config.paths.repo_root = join(rootDir, config.paths.repo_root);
        config.paths.logs = join(rootDir, config.paths.logs);
        config.paths.events = join(rootDir, config.paths.events);
        config.paths.storage = join(rootDir, config.paths.storage);
        config.paths.autopsy_output = join(rootDir, config.paths.autopsy_output);
        config.paths.patches = join(rootDir, config.paths.patches);
        config.paths.pr_description = join(rootDir, config.paths.pr_description);
        config.paths.repro_logs = join(rootDir, config.paths.repro_logs);
        config.paths.reports = join(rootDir, config.paths.reports);

        // Ensure storage defaults if missing
        if (!config.storage) {
            throw new Error("Storage configuration missing in aia.config.yaml");
        }

        // Ensure AI defaults
        if (!config.ai) {
            config.ai = { provider: "mock", api_key: "PLACEHOLDER", model: "mock" };
        }
    } else {
        // In Docker, we rely on the paths being absolute or relative to WORKDIR /app
        // The default config has valid relative paths for /app, or we can force absolute
        config.paths.repo_root = "/app";
        config.paths.logs = "/logs/app.log";
        config.paths.events = "/events";
        config.paths.storage = "/storage";
        config.paths.autopsy_output = "/autopsy_output";
        config.paths.patches = "/patches";
        config.paths.reports = "/app/dashboard/reports";

        // R2 defaults handling
        if (!config.storage) {
            throw new Error("Storage configuration missing in aia.config.yaml");
        }
        if (!config.ai) {
            config.ai = { provider: "mock", api_key: "PLACEHOLDER", model: "mock" };
        }
    }

    // Override with Env Vars
    if (process.env.PORT) {
        // ... handled by service-specific logic if need override
    }

    cachedConfig = config;
    return config;
}
