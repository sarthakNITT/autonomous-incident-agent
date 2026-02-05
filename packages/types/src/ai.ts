export interface AiReasoningRequest {
    stacktrace: string;
    file_context: {
        path: string;
        content: string;
        line_range?: string;
    }[];
    error_message: string;
}

export interface AiReasoningResponse {
    root_cause: string;
    patch: {
        file_path: string;
        diff: string;
    };
    test_code?: string;
    confidence: number;
}
