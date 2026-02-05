export interface ScenarioPayload {
    request_id: string;
    payload: {
        action: "cause_error" | "safe" | "cause_crash" | "cause_cpu";
        [key: string]: unknown;
    };
    expected_error_pattern?: string;
}

export interface TriggerResponse {
    status: "ok" | "error";
    message?: string;
}

export * from "./agent";
export * from "./agent";
export * from "./router";
export * from "./autopsy";
export * from "./storage";
export * from "./observability";
export * from "./ai";
export * from "./config";
export * from "./git";
