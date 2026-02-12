export interface PatchSuggestion {
  file_path: string;
  language: string;
  patch_diff: string;
}

export interface AutopsyResult {
  root_cause_text: string;
  commit_hash: string;
  file_path: string;
  line_range: string;
  suggested_patch: PatchSuggestion;
  confidence: number;
  fix_prompt?: string;
  manual_steps?: string[];
}
