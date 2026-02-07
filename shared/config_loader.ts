import { Config } from "@repo/types";
import { readFileSync, existsSync } from "fs";
import { join, isAbsolute } from "path";
import yaml from "js-yaml";

let cachedConfig: Config | null = null;
const isDocker = existsSync("/.dockerenv") || process.env.BUN_ENV === "docker";

export function loadConfig(): Config {
    if (cachedConfig) return cachedConfig;

    const configPath = process.env.AIA_CONFIG_PATH || join(__dirname, "../../config/aia.config.yaml");

    const possiblePaths = [
        process.env.AIA_CONFIG_PATH,
        join(process.cwd(), "config", "aia.config.yaml"),
        join(process.cwd(), "aia.config.yaml"),
        join(process.cwd(), "../aia.config.yaml"),
        join(process.cwd(), "../../aia.config.yaml"), // apps/appname/ to root
        join(process.cwd(), "../../../aia.config.yaml"), // deep nested
        "/config/aia.config.yaml",
        "/app/config/aia.config.yaml"
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
        throw new Error(`Could not find aia.config.yaml in ${possiblePaths.join(", ")}`);
    }

    const config = yaml.load(loadedContent) as Config;

    const rootDir = process.cwd();

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

        if (!config.storage) {
            throw new Error("Storage configuration missing in aia.config.yaml");
        }

        if (!config.ai) {
            config.ai = { provider: "mock", api_key: "PLACEHOLDER", model: "mock" };
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
            throw new Error("Storage configuration missing in aia.config.yaml");
        }
        if (!config.ai) {
            config.ai = { provider: "mock", api_key: "PLACEHOLDER", model: "mock" };
        }
    }

    if (process.env.PORT) { }

    if (!config.github) {
        config.github = {
            provider: "mock",
            token: "PLACEHOLDER",
            org: "mock-org",
            repo: "mock-repo",
            base_branch: "main",
            username: "aia-bot",
            email: "bot@aia.local"
        };
    }

    if (!config.services.git) {
        config.services.git = { port: 3004, base_url: "http://localhost:3004" };
    }

    if (!config.services.repro) {
        config.services.repro = { port: 3005, base_url: "http://localhost:3005" };
    }

    if (!config.services.repro) {
        config.services.repro = { port: 3005, base_url: "http://localhost:3005" };
    }

    if (!config.services.state) {
        config.services.state = { port: 3006, base_url: "http://localhost:3006" };
    }

    if (!config.services.web) {
        config.services.web = { port: 3007, base_url: "http://localhost:3007" };
    }

    if (!config.services.docs) {
        config.services.docs = { port: 3008, base_url: "http://localhost:3008" };
    }

    if (!config.services.dashboard) {
        config.services.dashboard = { port: 3000, base_url: "http://localhost:3000" };
    }

    if (!config.services.sample_app) {
        config.services.sample_app = { port: 3009, base_url: "http://localhost:3009" };
    }

    if (!config.database) {
        config.database = {
            provider: "sqlite",
            path: join(process.cwd(), "aira.db")
        };
    }

    cachedConfig = config;
    return config;
}
