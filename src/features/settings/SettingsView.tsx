import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { useSettings } from "@/hooks/useSettings";
import { testAiConnection } from "@/hooks/useApi";

export function SettingsView() {
  const { settings, loading, error, editSettings, refresh } = useSettings();
  const [form, setForm] = useState({
    company_name: "",
    company_website: "",
    contact_email: "",
    contact_phone: "",
    reports_base_folder: "",
    local_ai_endpoint: "",
    local_ai_model_name: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [aiTestStatus, setAiTestStatus] = useState<"idle" | "testing" | "ok" | "error">("idle");
  const [aiTestResult, setAiTestResult] = useState<string>("");

  useEffect(() => {
    if (settings) {
      setForm({
        company_name: settings.company_name,
        company_website: settings.company_website,
        contact_email: settings.contact_email ?? "",
        contact_phone: settings.contact_phone ?? "",
        reports_base_folder: settings.reports_base_folder ?? "",
        local_ai_endpoint: settings.local_ai_endpoint,
        local_ai_model_name: settings.local_ai_model_name,
      });
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setSaveStatus("saving");
      await editSettings(form);
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
    } finally {
      setSaving(false);
    }
  };

  const handleTestAi = async () => {
    try {
      setAiTestStatus("testing");
      const result = await testAiConnection(form.local_ai_endpoint);
      setAiTestResult(result);
      setAiTestStatus("ok");
    } catch (e) {
      setAiTestResult(e instanceof Error ? e.message : "Błąd testu");
      setAiTestStatus("error");
    }
  };

  if (loading) return <Spinner text="Ładowanie ustawień..." />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  return (
    <div>
      <PageHeader title="Ustawienia" subtitle="Konfiguracja aplikacji" />

      <div className="space-y-6 max-w-2xl">
        <section className="card">
          <h3 className="font-medium text-text-primary mb-3">Dane firmy</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Nazwa firmy
              </label>
              <input
                type="text"
                className="input-field"
                value={form.company_name}
                onChange={(e) => setForm({ ...form, company_name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Strona internetowa
              </label>
              <input
                type="url"
                className="input-field"
                value={form.company_website}
                onChange={(e) => setForm({ ...form, company_website: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Email kontaktowy
                </label>
                <input
                  type="email"
                  className="input-field"
                  value={form.contact_email}
                  onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  className="input-field"
                  value={form.contact_phone}
                  onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="card">
          <h3 className="font-medium text-text-primary mb-3">Lokalny model AI</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Adres endpointu Ollama
              </label>
              <input
                type="url"
                className="input-field"
                value={form.local_ai_endpoint}
                onChange={(e) => setForm({ ...form, local_ai_endpoint: e.target.value })}
                placeholder="http://localhost:11434"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Nazwa modelu
              </label>
              <input
                type="text"
                className="input-field"
                value={form.local_ai_model_name}
                onChange={(e) => setForm({ ...form, local_ai_model_name: e.target.value })}
                placeholder="qwen2.5:7b"
              />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleTestAi} disabled={aiTestStatus === "testing"} className="btn-secondary text-sm">
                {aiTestStatus === "testing" ? "Testowanie..." : "Testuj połączenie"}
              </button>
              {aiTestStatus === "ok" && (
                <span className="text-xs text-success">{aiTestResult}</span>
              )}
              {aiTestStatus === "error" && (
                <span className="text-xs text-error">{aiTestResult}</span>
              )}
            </div>
          </div>
        </section>

        <section className="card">
          <h3 className="font-medium text-text-primary mb-3">Folder raportów</h3>
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Ścieżka do zapisu raportów
            </label>
            <input
              type="text"
              className="input-field"
              value={form.reports_base_folder}
              onChange={(e) => setForm({ ...form, reports_base_folder: e.target.value })}
              placeholder="D:\Raporty\alldayit"
            />
          </div>
        </section>

        <div className="flex items-center gap-3">
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? "Zapisywanie..." : "Zapisz ustawienia"}
          </button>
          {saveStatus === "saved" && (
            <span className="text-sm text-success">Zapisano</span>
          )}
          {saveStatus === "error" && (
            <span className="text-sm text-error">Błąd zapisu</span>
          )}
        </div>
      </div>
    </div>
  );
}
