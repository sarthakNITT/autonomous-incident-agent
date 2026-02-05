export interface GitHubConfig {
    provider: "github" | "gitlab" | "mock";
    token: string;
    org: string;
    repo: string;
    base_branch: string;
    username: string;
    email: string;
}

export interface PullRequestRequest {
    incident_id: string;
    title: string;
    body: string;
    patches: Array<{
        path: string;
        content: string;
    }>;
    files: Array<{
        path: string;
        content: string;
    }>;
}

export interface PullRequestResult {
    url: string;
    number: number;
    branch: string;
    status: "created" | "failed" | "skipped";
}

export interface RepoContext {
    clone_url: string;
    local_path: string;
    work_dir: string;
}
