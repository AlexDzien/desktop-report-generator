export interface Client {
  id: string;
  name: string;
  contact_name: string | null;
  contact_email: string | null;
  industry: string | null;
  notes: string | null;
  default_reports_folder: string | null;
  created_at: string;
  updated_at: string;
}

export type ReportStatus =
  | "draft"
  | "ai_processing"
  | "ai_ready"
  | "edited"
  | "generating_pdf"
  | "generated"
  | "error";

export interface Report {
  id: string;
  client_id: string;
  reporting_month: string;
  raw_summary: string;
  key_results: string | null;
  optimizations: string | null;
  issues: string | null;
  recommendations_input: string | null;
  next_month_plan: string | null;
  ai_output_json: string | null;
  edited_output_json: string | null;
  status: ReportStatus;
  pdf_path: string | null;
  created_at: string;
  updated_at: string;
  generated_at: string | null;
}

export interface Settings {
  id: number;
  company_name: string;
  company_website: string;
  company_logo_path: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  reports_base_folder: string | null;
  local_ai_endpoint: string;
  local_ai_model_name: string;
  pdf_template_name: string;
  created_at: string;
  updated_at: string;
}

export interface ReportEvent {
  id: number;
  report_id: string;
  event_type: string;
  message: string | null;
  created_at: string;
}

export interface AiReportOutput {
  client_summary: string;
  main_results: AiMetric[];
  actions_completed: string[];
  campaign_insights: string[];
  recommendations: string[];
  expert_comment: string;
  next_steps: string[];
  missing_data_notes: string[];
}

export interface AiMetric {
  label: string;
  value: string;
  explanation: string;
}
