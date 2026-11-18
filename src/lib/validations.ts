import { z } from "zod";

export const clientSchema = z.object({
  name: z.string().min(2, "Nazwa musi mieć co najmniej 2 znaki"),
  contact_name: z.string().nullable().optional(),
  contact_email: z
    .string()
    .email("Nieprawidłowy format email")
    .nullable()
    .optional()
    .or(z.literal("")),
  industry: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
  default_reports_folder: z.string().nullable().optional(),
});

export type ClientInput = z.infer<typeof clientSchema>;

export const reportInputSchema = z.object({
  client_id: z.string().min(1, "Wybierz klienta"),
  reporting_month: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "Format: RRRR-MM"),
  raw_summary: z
    .string()
    .min(50, "Podsumowanie musi mieć co najmniej 50 znaków"),
  key_results: z.string().nullable().optional(),
  optimizations: z.string().nullable().optional(),
  issues: z.string().nullable().optional(),
  recommendations_input: z.string().nullable().optional(),
  next_month_plan: z.string().nullable().optional(),
});

export type ReportInput = z.infer<typeof reportInputSchema>;

export const reportUpdateSchema = z.object({
  id: z.string(),
  raw_summary: z.string().optional(),
  key_results: z.string().nullable().optional(),
  optimizations: z.string().nullable().optional(),
  issues: z.string().nullable().optional(),
  recommendations_input: z.string().nullable().optional(),
  next_month_plan: z.string().nullable().optional(),
  ai_output_json: z.string().nullable().optional(),
  edited_output_json: z.string().nullable().optional(),
  status: z.string().optional(),
  pdf_path: z.string().nullable().optional(),
});

export type ReportUpdate = z.infer<typeof reportUpdateSchema>;

export const aiMetricSchema = z.object({
  label: z.string(),
  value: z.string(),
  explanation: z.string(),
});

export const aiOutputSchema = z.object({
  client_summary: z.string(),
  main_results: z.array(aiMetricSchema),
  actions_completed: z.array(z.string()),
  campaign_insights: z.array(z.string()),
  recommendations: z.array(z.string()),
  expert_comment: z.string(),
  next_steps: z.array(z.string()),
  missing_data_notes: z.array(z.string()),
});

export type AiOutput = z.infer<typeof aiOutputSchema>;

export const settingsSchema = z.object({
  company_name: z.string().min(1),
  company_website: z.string().url().or(z.literal("")),
  company_logo_path: z.string().nullable().optional(),
  contact_email: z.string().email().or(z.literal("")).nullable().optional(),
  contact_phone: z.string().nullable().optional(),
  reports_base_folder: z.string().nullable().optional(),
  local_ai_endpoint: z.string().url(),
  local_ai_model_name: z.string().min(1),
  pdf_template_name: z.string().min(1),
});

export type SettingsInput = z.infer<typeof settingsSchema>;
