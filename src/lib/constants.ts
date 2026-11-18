export const APP_NAME = "Generator Raportów";
export const COMPANY_NAME = "alldayit.pl";
export const COMPANY_WEBSITE = "https://alldayit.pl";

export const REPORT_STATUSES = {
  draft: { label: "Szkic", variant: "neutral" as const },
  ai_processing: { label: "Analiza AI", variant: "info" as const },
  ai_ready: { label: "AI gotowe", variant: "info" as const },
  edited: { label: "Edytowany", variant: "warning" as const },
  generating_pdf: { label: "Generowanie PDF", variant: "info" as const },
  generated: { label: "Wygenerowany", variant: "success" as const },
  error: { label: "Błąd", variant: "error" as const },
} as const;

export const MONTH_NAMES_PL = [
  "Styczeń", "Luty", "Marzec", "Kwiecień",
  "Maj", "Czerwiec", "Lipiec", "Sierpień",
  "Wrzesień", "Październik", "Listopad", "Grudzień",
];

export const AI_TIMEOUT_MS = 120_000;
export const AI_MAX_RETRIES = 2;
export const AUTOSAVE_DELAY_MS = 2000;
export const DEFAULT_AI_MODEL = "qwen2.5:7b";
export const DEFAULT_AI_ENDPOINT = "http://localhost:11434";
