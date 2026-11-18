import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Spinner } from "@/components/ui/Spinner";
import { useClients } from "@/hooks/useClients";
import { useSettings } from "@/hooks/useSettings";
import * as api from "@/hooks/useApi";
import { getCurrentMonth, formatMonth } from "@/lib/formatters";
import type { Client, AiReportOutput } from "@/lib/types";

type WizardStep = "client" | "month" | "summary" | "processing" | "result";

export function ReportWizard() {
  const navigate = useNavigate();
  const { clients, loading: clientsLoading } = useClients();
  const { settings } = useSettings();

  const [step, setStep] = useState<WizardStep>("client");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [reportMonth, setReportMonth] = useState(getCurrentMonth());
  const [summary, setSummary] = useState("");
  const [keyResults, setKeyResults] = useState("");
  const [optimizations, setOptimizations] = useState("");
  const [issues, setIssues] = useState("");
  const [recommendationsInput, setRecommendationsInput] = useState("");
  const [nextMonthPlan, setNextMonthPlan] = useState("");
  const [reportId, setReportId] = useState<string | null>(null);
  const [aiOutput, setAiOutput] = useState<AiReportOutput | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const steps = [
    { key: "client", label: "Klient" },
    { key: "month", label: "Miesiąc" },
    { key: "summary", label: "Podsumowanie" },
  ];

  const currentStepIndex = steps.findIndex((s) => s.key === step);

  const handleAnalyze = useCallback(async () => {
    if (!selectedClient || !settings) return;

    setStep("processing");
    setProcessing(true);
    setAiError(null);

    try {
      const id = await api.createReport({
        client_id: selectedClient.id,
        reporting_month: reportMonth,
        raw_summary: summary,
        key_results: keyResults || null,
        optimizations: optimizations || null,
        issues: issues || null,
        recommendations_input: recommendationsInput || null,
        next_month_plan: nextMonthPlan || null,
      });
      setReportId(id);

      const output = await api.analyzeSummary(
        {
          raw_summary: summary,
          key_results: keyResults || null,
          optimizations: optimizations || null,
          issues: issues || null,
          recommendations_input: recommendationsInput || null,
          next_month_plan: nextMonthPlan || null,
          client_name: selectedClient.name,
          reporting_month: reportMonth,
        },
        settings.local_ai_endpoint,
        settings.local_ai_model_name,
      );

      setAiOutput(output);

      await api.updateReport({
        id,
        ai_output_json: JSON.stringify(output),
        edited_output_json: JSON.stringify(output),
        status: "ai_ready",
      });

      setStep("result");
    } catch (e) {
      setAiError(e instanceof Error ? e.message : "Wystąpił nieznany błąd AI");
      setStep("summary");
    } finally {
      setProcessing(false);
    }
  }, [selectedClient, settings, reportMonth, summary, keyResults, optimizations, issues, recommendationsInput, nextMonthPlan]);

  if (clientsLoading) return <Spinner text="Ładowanie klientów..." />;

  return (
    <div>
      <PageHeader title="Nowy raport" subtitle="Kreator raportu Google Ads" />

      {step !== "processing" && step !== "result" && (
        <div className="flex items-center gap-2 mb-6">
          {steps.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  i < currentStepIndex
                    ? "bg-success/20 text-success"
                    : i === currentStepIndex
                      ? "bg-accent text-white"
                      : "bg-bg-tertiary text-text-muted"
                }`}
              >
                {i < currentStepIndex ? "✓" : i + 1}
              </div>
              <span
                className={`text-sm ${
                  i === currentStepIndex ? "text-text-primary" : "text-text-muted"
                }`}
              >
                {s.label}
              </span>
              {i < steps.length - 1 && <div className="w-8 h-px bg-border" />}
            </div>
          ))}
        </div>
      )}

      {step === "client" && (
        <div className="card max-w-xl">
          <h3 className="font-medium text-text-primary mb-3">Wybierz klienta</h3>
          {clients.length === 0 ? (
            <p className="text-sm text-text-secondary">
              Brak klientów. Najpierw dodaj klienta w sekcji{" "}
              <button onClick={() => navigate("/klienci")} className="text-accent hover:underline">
                Klienci
              </button>
              .
            </p>
          ) : (
            <div className="space-y-2">
              {clients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => { setSelectedClient(client); setStep("month"); }}
                  className={`w-full text-left p-3 rounded-md border transition-colors ${
                    selectedClient?.id === client.id
                      ? "border-accent bg-accent/5"
                      : "border-border hover:border-border-hover hover:bg-bg-tertiary"
                  }`}
                >
                  <p className="font-medium text-text-primary">{client.name}</p>
                  {client.contact_name && (
                    <p className="text-xs text-text-secondary">{client.contact_name}</p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {step === "month" && (
        <div className="card max-w-xl">
          <h3 className="font-medium text-text-primary mb-3">
            Klient: <span className="text-accent">{selectedClient?.name}</span>
          </h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Miesiąc raportu
            </label>
            <input
              type="month"
              className="input-field"
              value={reportMonth}
              onChange={(e) => setReportMonth(e.target.value)}
            />
            <p className="text-xs text-text-muted mt-1">
              Wybrano: {formatMonth(reportMonth)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setStep("client")} className="btn-secondary text-sm">
              Wstecz
            </button>
            <button onClick={() => setStep("summary")} className="btn-primary text-sm">
              Dalej
            </button>
          </div>
        </div>
      )}

      {step === "summary" && (
        <div className="card max-w-2xl">
          <h3 className="font-medium text-text-primary mb-1">
            Podsumowanie kampanii — <span className="text-accent">{selectedClient?.name}</span>,{" "}
            {formatMonth(reportMonth)}
          </h3>
          <p className="text-xs text-text-muted mb-4">
            Wpisz podsumowanie kampanii Google Ads z tego miesiąca. Im więcej szczegółów, tym lepszy raport.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Podsumowanie kampanii *
              </label>
              <textarea
                className="textarea-field min-h-[150px]"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Opisz co wydarzyło się w kampanii w tym miesiącu. Np. jakie zmiany zostały wprowadzone, jakie wyniki osiągnięto, z jakimi problemami się spotkano..."
              />
              <p className="text-xs text-text-muted mt-1">
                Min. 50 znaków. Aktualnie: {summary.length}
              </p>
            </div>

            <details className="group">
              <summary className="text-sm font-medium text-text-secondary cursor-pointer hover:text-text-primary">
                Dodatkowe informacje (opcjonalne)
              </summary>
              <div className="mt-3 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Najważniejsze wyniki
                  </label>
                  <textarea
                    className="textarea-field"
                    value={keyResults}
                    onChange={(e) => setKeyResults(e.target.value)}
                    placeholder="np. 1234 kliknięć, 45678 wyświetleń, koszt 5000 zł..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Wykonane optymalizacje
                  </label>
                  <textarea
                    className="textarea-field"
                    value={optimizations}
                    onChange={(e) => setOptimizations(e.target.value)}
                    placeholder="np. Zmieniono słowa kluczowe, wykluczono frazy..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Problemy
                  </label>
                  <textarea
                    className="textarea-field"
                    value={issues}
                    onChange={(e) => setIssues(e.target.value)}
                    placeholder="np. Wzrost CPC, spadek CTR..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Rekomendacje
                  </label>
                  <textarea
                    className="textarea-field"
                    value={recommendationsInput}
                    onChange={(e) => setRecommendationsInput(e.target.value)}
                    placeholder="np. Zwiększyć budżet na kampanie X..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-muted mb-1">
                    Plan na kolejny miesiąc
                  </label>
                  <textarea
                    className="textarea-field"
                    value={nextMonthPlan}
                    onChange={(e) => setNextMonthPlan(e.target.value)}
                    placeholder="np. Kontynuować optymalizację, dodać nowe reklamy..."
                    rows={3}
                  />
                </div>
              </div>
            </details>

            {aiError && (
              <div className="p-3 rounded-md bg-error/10 border border-error/20">
                <p className="text-sm text-error">{aiError}</p>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button onClick={() => setStep("month")} className="btn-secondary text-sm">
                Wstecz
              </button>
              <button
                onClick={handleAnalyze}
                disabled={summary.length < 50}
                className="btn-primary text-sm"
              >
                Przeanalizuj i przygotuj raport
              </button>
            </div>
          </div>
        </div>
      )}

      {step === "processing" && (
        <div className="card max-w-xl">
          <Spinner text="Analizuję podsumowanie kampanii..." />
          <p className="text-xs text-text-muted text-center mt-2">
            Lokalny model AI przetwarza dane. Może to potrwać do 2 minut.
          </p>
        </div>
      )}

      {step === "result" && aiOutput && reportId && (
        <div className="card max-w-3xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-text-primary">Raport gotowy do edycji</h3>
            <span className="badge-success">AI przeanalizowało dane</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Podsumowanie dla klienta
              </label>
              <textarea
                className="textarea-field"
                value={aiOutput.client_summary}
                onChange={(e) =>
                  setAiOutput({ ...aiOutput, client_summary: e.target.value })
                }
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Najważniejsze wyniki
              </label>
              {aiOutput.main_results.map((result: { label: string; value: string; explanation: string }, i: number) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input
                    className="input-field flex-1"
                    value={result.label}
                    onChange={(e) => {
                      const updated = [...aiOutput.main_results];
                      updated[i] = { ...updated[i], label: e.target.value };
                      setAiOutput({ ...aiOutput, main_results: updated });
                    }}
                    placeholder="Etykieta"
                  />
                  <input
                    className="input-field w-32"
                    value={result.value}
                    onChange={(e) => {
                      const updated = [...aiOutput.main_results];
                      updated[i] = { ...updated[i], value: e.target.value };
                      setAiOutput({ ...aiOutput, main_results: updated });
                    }}
                    placeholder="Wartość"
                  />
                  <input
                    className="input-field flex-1"
                    value={result.explanation}
                    onChange={(e) => {
                      const updated = [...aiOutput.main_results];
                      updated[i] = { ...updated[i], explanation: e.target.value };
                      setAiOutput({ ...aiOutput, main_results: updated });
                    }}
                    placeholder="Opis"
                  />
                </div>
              ))}
            </div>

            {(["actions_completed", "campaign_insights", "recommendations", "next_steps"] as const).map(
              (field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-text-secondary mb-1">
                    {field === "actions_completed" && "Wykonane działania"}
                    {field === "campaign_insights" && "Wnioski"}
                    {field === "recommendations" && "Rekomendacje"}
                    {field === "next_steps" && "Następne kroki"}
                  </label>
                  <textarea
                    className="textarea-field"
                    value={aiOutput[field].join("\n")}
                    onChange={(e) =>
                      setAiOutput({
                        ...aiOutput,
                        [field]: e.target.value.split("\n").filter((l) => l.trim()),
                      })
                    }
                    rows={4}
                  />
                  <p className="text-xs text-text-muted mt-1">Jeden punkt w każdym wierszu</p>
                </div>
              ),
            )}

            <div>
              <label className="block text-sm font-medium text-text-secondary mb-1">
                Komentarz eksperta
              </label>
              <textarea
                className="textarea-field"
                value={aiOutput.expert_comment}
                onChange={(e) => setAiOutput({ ...aiOutput, expert_comment: e.target.value })}
                rows={3}
              />
            </div>

            {aiOutput.missing_data_notes.length > 0 && (
              <div className="p-3 rounded-md bg-info/10 border border-info/20">
                <p className="text-sm font-medium text-info mb-1">Notatki o brakujących danych:</p>
                <ul className="text-xs text-text-secondary space-y-0.5">
                  {aiOutput.missing_data_notes.map((note: string, i: number) => (
                    <li key={i}>• {note}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button onClick={() => setStep("summary")} className="btn-secondary text-sm">
                Wróć do edycji
              </button>
              <button
                onClick={async () => {
                  if (reportId && selectedClient && settings) {
                    setProcessing(true);
                    try {
                      await api.updateReport({
                        id: reportId,
                        edited_output_json: JSON.stringify(aiOutput),
                        status: "edited",
                      });

                      const slug = selectedClient.name
                        .toLowerCase()
                        .normalize("NFD")
                        .replace(/[\u0300-\u036f]/g, "")
                        .replace(/[^a-z0-9\s-]/g, "")
                        .replace(/\s+/g, "-")
                        .replace(/-+/g, "-");

                      const baseFolder = settings.reports_base_folder || "Raporty";
                      const dir = `${baseFolder}/${slug}/${reportMonth}`;
                      const fileName = `raport-google-ads-${slug}-${reportMonth}.html`;
                      const filePath = `${dir}/${fileName}`;

                      const monthNames = [
                        "Styczeń", "Luty", "Marzec", "Kwiecień",
                        "Maj", "Czerwiec", "Lipiec", "Sierpień",
                        "Wrzesień", "Październik", "Listopad", "Grudzień",
                      ];
                      const [y, m] = reportMonth.split("-");
                      const monthDisplay = `${monthNames[parseInt(m) - 1]} ${y}`;

                      const html = await api.generateReportHtml({
                        client_name: selectedClient.name,
                        reporting_month: reportMonth,
                        report_month_display: monthDisplay,
                        company_name: settings.company_name,
                        company_website: settings.company_website,
                        contact_email: settings.contact_email || "",
                        contact_phone: settings.contact_phone || "",
                        logo_path: settings.company_logo_path || "",
                        generation_date: new Date().toLocaleDateString("pl-PL"),
                        client_summary: aiOutput.client_summary,
                        main_results: aiOutput.main_results,
                        actions_completed: aiOutput.actions_completed,
                        campaign_insights: aiOutput.campaign_insights,
                        recommendations: aiOutput.recommendations,
                        expert_comment: aiOutput.expert_comment,
                        next_steps: aiOutput.next_steps,
                        missing_data_notes: aiOutput.missing_data_notes,
                      });

                      await api.saveReportHtml(html, filePath);

                      await api.updateReport({
                        id: reportId,
                        pdf_path: filePath,
                        status: "generated",
                      });

                      await api.openFile(filePath);

                      navigate("/historia");
                    } catch (e) {
                      setAiError(e instanceof Error ? e.message : "Błąd generowania PDF");
                    } finally {
                      setProcessing(false);
                    }
                  }
                }}
                disabled={processing}
                className="btn-primary text-sm"
              >
                {processing ? "Generowanie..." : "Generuj raport HTML"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
