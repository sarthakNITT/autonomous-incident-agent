export interface Config {
    environment: string;
    project_name: string;
    paths: {
        repo_root: string;
        logs: string;
        events: string;
        storage: string;
        output: string;
        autopsy_output: string;
        patches: string;
        pr_description: string;
        repro_logs: string;
        reports: string;
    };
    services: {
        sample_app: {
            port: number;
            base_url: string;
        };
        agent: {
            log_pattern: string;
        };
        router: {
            port: number;
            base_url: string;
        };
        autopsy: {
            port: number;
            base_url: string;
        };
        dashboard: {
            port: number;
            base_url: string;
        };
    };
    demo: {
        scenario_file_pattern: string;
    };
}
