export interface LogSnapshot {
    timestamp: string;
    level: string;
    message: string;
}

export interface IncidentEvent {
    id: string;
    timestamp: string;
    severity: "critical" | "warning" | "info";
    service_name: string;
    error_details: {
        message: string;
    };
    stacktrace: string;
    last_logs: LogSnapshot[];
    request_id: string;
    environment: {
        env: string;
        version: string;
    };
}
