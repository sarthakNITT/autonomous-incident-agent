import type { StorageConfig } from "./storage";
import type { GitHubConfig } from "./git";

export interface Config {
    project_name: string;
    environment: string;
    paths: {
        repo_root: string;
        logs: string;
        events: string;
        storage: string;
        autopsy_output: string;
        patches: string;
        pr_description: string;
        repro_logs: string;
        reports: string;
        output: string;
    };
    services: {
        router: { port: number; base_url: string; };
        agent: { port: number; base_url: string; };
        autopsy: { port: number; base_url: string; };
        dashboard: { port: number; base_url: string; };
        sample_app: { port: number; base_url: string; };
        git: { port: number; base_url: string; };
        repro: { port: number; base_url: string; };
        state: { port: number; base_url: string; };
        web: { port: number; base_url: string; };
        docs: { port: number; base_url: string; };
    };
    storage: {
        provider: "r2" | "mock";
        bucket: string;
        access_key: string;
        secret_key: string;
        region: string;
        endpoint: string;
    };
    database: {
        provider: "sqlite" | "postgres";
        path: string; // for sqlite
        url?: string; // for postgres
    };
    ai: {
        provider: "you.com" | "mock";
        api_key: string;
        model: string;
    };
    github: GitHubConfig;
}
