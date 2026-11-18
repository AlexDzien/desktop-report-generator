import { invoke } from "@tauri-apps/api/core";
import type { Client, Report, Settings } from "@/lib/types";
import type { ClientInput, ReportInput, ReportUpdate, SettingsInput, AiOutput } from "@/lib/validations";

export async function createClient(input: ClientInput): Promise<string> {
  return invoke<string>("create_client", { input });
}

export async function getClients(): Promise<Client[]> {
  return invoke<Client[]>("get_clients");
}

export async function getClient(id: string): Promise<Client> {
  return invoke<Client>("get_client", { id });
}

export async function updateClient(input: ClientInput & { id: string }): Promise<void> {
  return invoke<void>("update_client", { input });
}

export async function deleteClient(id: string): Promise<void> {
  return invoke<void>("delete_client", { id });
}

export async function createReport(input: ReportInput): Promise<string> {
  return invoke<string>("create_report", { input });
}

export async function getReports(): Promise<Report[]> {
  return invoke<Report[]>("get_reports");
}

export async function getReport(id: string): Promise<Report> {
  return invoke<Report>("get_report", { id });
}

export async function updateReport(input: ReportUpdate): Promise<void> {
  return invoke<void>("update_report", { input });
}

export async function deleteReport(id: string): Promise<void> {
  return invoke<void>("delete_report", { id });
}

export async function getReportsByClient(clientId: string): Promise<Report[]> {
  return invoke<Report[]>("get_reports_by_client", { clientId });
}

export async function getSettings(): Promise<Settings> {
  return invoke<Settings>("get_settings");
}

export async function updateSettings(input: Partial<SettingsInput>): Promise<void> {
  return invoke<void>("update_settings", { input });
}

export interface AnalyzeInput {
  raw_summary: string;
  key_results?: string | null;
  optimizations?: string | null;
  issues?: string | null;
  recommendations_input?: string | null;
  next_month_plan?: string | null;
  client_name: string;
  reporting_month: string;
}

export async function analyzeSummary(
  input: AnalyzeInput,
  endpoint: string,
  model: string,
): Promise<AiOutput> {
  return invoke<AiOutput>("analyze_summary", {
    input,
    endpoint,
    model,
  });
}

export async function testAiConnection(endpoint: string): Promise<string> {
  return invoke<string>("test_ai_connection", { endpoint });
}

export interface PdfMetric {
  label: string;
  value: string;
  explanation: string;
}

export interface PdfInput {
  client_name: string;
  reporting_month: string;
  report_month_display: string;
  company_name: string;
  company_website: string;
  contact_email: string;
  contact_phone: string;
  logo_path: string;
  generation_date: string;
  client_summary: string;
  main_results: PdfMetric[];
  actions_completed: string[];
  campaign_insights: string[];
  recommendations: string[];
  expert_comment: string;
  next_steps: string[];
  missing_data_notes: string[];
}

export async function generateReportHtml(input: PdfInput): Promise<string> {
  return invoke<string>("generate_report_html", { input });
}

export async function saveReportHtml(html: string, path: string): Promise<void> {
  return invoke<void>("save_report_html", { html, path });
}

export async function openFile(path: string): Promise<void> {
  return invoke<void>("open_file", { path });
}

export async function revealInExplorer(path: string): Promise<void> {
  return invoke<void>("reveal_in_explorer", { path });
}
