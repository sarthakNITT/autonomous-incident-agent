import { load } from "js-yaml";
import { join } from "path";
import { readFileSync, existsSync } from "fs";
import type { Config } from "../packages/types/src/config";

// Singleton to cache config
let configCache: Config | null = null;

export function loadConfig(): Config {
    if (configCache) return configCache;

    // Determine where config file is
    // In Docker, we mount to /app/config/aia.config.yaml
    // Locally, we are often in apps/<name>, so we look up 2 levels
    // But better to check env var or standard locations

    const possiblePaths = [
        "/app/config/aia.config.yaml",              // Docker volume mount
        join(process.cwd(), "config/aia.config.yaml"), // From root
        join(process.cwd(), "../../config/aia.config.yaml"), // From apps/xyz
        join(process.cwd(), "../../../config/aia.config.yaml") // Deeply nested
    ];

    let configPath = "";
    for (const p of possiblePaths) {
        if (existsSync(p)) {
            configPath = p;
            break;
        }
    }

    if (!configPath) {
        console.error("Searched in:", possiblePaths);
        throw new Error("Could not find aia.config.yaml");
    }

    const fileContents = readFileSync(configPath, 'utf8');
    const config = load(fileContents) as Config;

    // Handle path resolution for Docker vs Local
    // If not in docker (checked via env or file existence), resolve relative paths
    const isDocker = existsSync("/.dockerenv") || process.env.BUN_ENV === "docker";

    if (!isDocker) {
        // Resolve paths relative to the config file location or project root
        // Assuming config is at <root>/config/aia.config.yaml, so .. is root
        const rootDir = join(configPath, "../..");

        config.paths.repo_root = join(rootDir, config.paths.repo_root);
        config.paths.logs = join(rootDir, config.paths.logs);
        config.paths.events = join(rootDir, config.paths.events);
        config.paths.storage = join(rootDir, config.paths.storage);
        config.paths.output = join(rootDir, config.paths.output);
        config.paths.autopsy_output = join(rootDir, config.paths.autopsy_output);
        config.paths.patches = join(rootDir, config.paths.patches);
        config.paths.pr_description = join(rootDir, config.paths.pr_description);
        config.paths.repro_logs = join(rootDir, config.paths.repro_logs);
        config.paths.reports = join(rootDir, config.paths.reports);
    } else {
        // In Docker, we rely on the paths being absolute or relative to WORKDIR /app
        // The default config has valid relative paths for /app, or we can force absolute
        // For now, let's assume the config values in yaml are suitable for Docker if unmodified
        // OR mapped volumes match the relative structure.
        // Actually, typically in docker we want absolute paths like /repo, /logs
        // We can override them here if we detect docker
        config.paths.repo_root = "/repo";
        config.paths.logs = "/logs/app.log";
        config.paths.events = "/events";
        config.paths.storage = "/storage";
        config.paths.output = "/output";
        config.paths.autopsy_output = "/autopsy_output"; // Needs volume mount!
        config.paths.patches = "/patches";
        config.paths.pr_description = "/pr_description"; // Needs volume mount or shared
        config.paths.repro_logs = "/repro_logs"; // Needs volume mount
        config.paths.reports = "/app/dashboard/reports"; // Matches Dashboard volume mount
    }

    configCache = config;
    return config;
}

