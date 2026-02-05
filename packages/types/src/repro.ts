export interface ReproResult {
    incident_id: string;
    commit_hash: string;
    passed: boolean;
    logs: {
        stdout: string;
        stderr: string;
    };
    timestamp: string;
}

export interface TestExecutionLog {
    command: string;
    exit_code: number;
    output: string;
}
