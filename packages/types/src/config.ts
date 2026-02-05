import type { StorageConfig } from "./storage";

export interface Config {
    environment: string;
    project_name: string;
    storage: StorageConfig;
    ai: {
        provider: string;
        api_key: string;
        model: string;
    };
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
    };
    services: {
        router: { port: number; base_url: string; };
        agent: { port: number; log_pattern: string; };
        autopsy: { port: number; base_url: string; };
        dashboard: { port: number; base_url: string; };
        sample_app: { port: number; base_url: string; failure_probability: number; };
    };
}
