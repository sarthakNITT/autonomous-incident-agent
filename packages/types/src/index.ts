export interface ScenarioPayload {
    request_id: string;
    payload: {
        action: "cause_error" | "safe";
        [key: string]: unknown;
    };
    expected_error_pattern?: string;
}

export interface TriggerResponse {
    status: "ok" | "error";
    message?: string;
}

export * from "./agent";
