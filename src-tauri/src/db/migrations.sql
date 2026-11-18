CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  contact_name TEXT,
  contact_email TEXT,
  industry TEXT,
  notes TEXT,
  default_reports_folder TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  reporting_month TEXT NOT NULL,
  raw_summary TEXT NOT NULL,
  key_results TEXT,
  optimizations TEXT,
  issues TEXT,
  recommendations_input TEXT,
  next_month_plan TEXT,
  ai_output_json TEXT,
  edited_output_json TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  pdf_path TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now')),
  generated_at TEXT
);

CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  company_name TEXT DEFAULT 'alldayit.pl',
  company_website TEXT DEFAULT 'https://alldayit.pl',
  company_logo_path TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  reports_base_folder TEXT,
  local_ai_endpoint TEXT DEFAULT 'http://localhost:11434',
  local_ai_model_name TEXT DEFAULT 'qwen2.5:7b',
  pdf_template_name TEXT DEFAULT 'default',
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS report_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  message TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO settings (id, company_name, company_website, local_ai_endpoint, local_ai_model_name, pdf_template_name)
VALUES (1, 'alldayit.pl', 'https://alldayit.pl', 'http://localhost:11434', 'qwen2.5:7b', 'default');
