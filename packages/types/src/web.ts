export interface WebConfig {
    port: number;
    base_url: string;
}

export interface IncidentViewModel {
    id: string;
    title: string;
    status: string;
    created_at: string;
    patch_diff?: string;
    root_cause?: string;
}
