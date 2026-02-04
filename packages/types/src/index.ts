// Shared type for the bug scenario payload
// Shared type for the bug scenario payload
export interface BugPayload {
    request_id: string;
    payload: {
        action: "cause_error" | "safe";
        [key: string]: unknown;
    };
    expected_error_pattern?: string;
}

export interface ApiResponse {
    status: "ok" | "error";
    message?: string;
}
