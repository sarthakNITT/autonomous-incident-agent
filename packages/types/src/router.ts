import type { IncidentEvent } from "./agent";

export interface EnvMetadata {
    service_name: string;
    env: string;
    version: string;
    received_at: string;
}

export interface RepoRef {
    repo_url: string;
    commit: string;
    branch: string;
}

export interface RouterSnapshot {
    snapshot_id: string;
    event: IncidentEvent;
    env_metadata: EnvMetadata;
    repo_git_ref: RepoRef;
}
