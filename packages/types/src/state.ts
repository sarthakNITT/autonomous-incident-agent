export enum IncidentStatus {
  DETECTED = "detected",
  ANALYZING = "analyzing",
  PATCHING = "patching",
  VALIDATING = "validating",
  RESOLVED = "resolved",
  FAILED = "failed",
}

export interface Incident {
  id: string;
  status: IncidentStatus;
  title: string;
  created_at: string;
  updated_at: string;

  snapshot_id?: string;
  root_cause?: string;
  patch_diff_key?: string;
  pr_url?: string;
  validation_status?: boolean;

  repo_name?: string;
  file_path?: string;
}

export interface CreateIncidentRequest {
  id?: string;
  title: string;
  status?: IncidentStatus;
}

export interface UpdateIncidentRequest {
  status?: IncidentStatus;
  root_cause?: string;
  patch_diff_key?: string;
  pr_url?: string;
  validation_status?: boolean;
  file_path?: string;
  snapshot_id?: string;
}
