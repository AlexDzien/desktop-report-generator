import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { Badge } from "@/components/ui/Badge";
import { useReports } from "@/hooks/useReports";
import { useClients } from "@/hooks/useClients";
import { formatMonth, formatDate } from "@/lib/formatters";
import { REPORT_STATUSES } from "@/lib/constants";
import type { Report } from "@/lib/types";

export function ReportHistoryView() {
  const { reports, loading, error, removeReport, refresh } = useReports();
  const { clients } = useClients();
  const [filterClient, setFilterClient] = useState<string>("");

  if (loading) return <Spinner text="Ładowanie raportów..." />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  const filtered = filterClient
    ? reports.filter((r) => r.client_id === filterClient)
    : reports;

  const getClientName = (clientId: string) =>
    clients.find((c) => c.id === clientId)?.name ?? "Nieznany";

  const handleDelete = async (report: Report) => {
    if (confirm(`Usunąć raport za ${formatMonth(report.reporting_month)}?`)) {
      await removeReport(report.id);
    }
  };

  return (
    <div>
      <PageHeader title="Historia raportów" subtitle={`${reports.length} raportów`} />

      {reports.length > 0 && (
        <div className="mb-4">
          <select
            className="input-field max-w-xs"
            value={filterClient}
            onChange={(e) => setFilterClient(e.target.value)}
          >
            <option value="">Wszyscy klienci</option>
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {filtered.length === 0 ? (
        <EmptyState
          icon="📁"
          title="Brak raportów"
          description="Wygenerowane raporty pojawią się tutaj."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((report) => {
            const statusInfo = REPORT_STATUSES[report.status as keyof typeof REPORT_STATUSES] ?? {
              label: report.status,
              variant: "neutral" as const,
            };
            return (
              <div key={report.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-text-primary">
                        {getClientName(report.client_id)}
                      </h3>
                      <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    </div>
                    <p className="text-sm text-text-secondary">
                      {formatMonth(report.reporting_month)}
                    </p>
                    <p className="text-xs text-text-muted mt-1">
                      Utworzono: {formatDate(report.created_at)}
                    </p>
                    {report.pdf_path && (
                      <p className="text-xs text-text-muted mt-0.5 truncate">
                        PDF: {report.pdf_path}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {report.pdf_path && (
                      <button className="text-xs text-accent hover:underline">
                        Otwórz PDF
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(report)}
                      className="text-xs text-text-secondary hover:text-error transition-colors"
                    >
                      Usuń
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
