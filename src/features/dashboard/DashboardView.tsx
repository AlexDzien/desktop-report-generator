import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { useReports } from "@/hooks/useReports";
import { useClients } from "@/hooks/useClients";
import { useSettings } from "@/hooks/useSettings";
import { formatMonth, formatDate } from "@/lib/formatters";
import { REPORT_STATUSES } from "@/lib/constants";

export function DashboardView() {
  const navigate = useNavigate();
  const { reports, loading: reportsLoading } = useReports();
  const { clients, loading: clientsLoading } = useClients();
  const { settings } = useSettings();

  const recentReports = reports.slice(0, 5);
  const getClientName = (clientId: string) =>
    clients.find((c) => c.id === clientId)?.name ?? "Nieznany";

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Przegląd raportów i klientów"
        actions={
          <button
            onClick={() => navigate("/nowy-raport")}
            className="btn-primary"
          >
            + Nowy raport
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <p className="text-sm text-text-secondary">Raporty</p>
          <p className="text-2xl font-bold mt-1">
            {reportsLoading ? "..." : reports.length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-text-secondary">Klienci</p>
          <p className="text-2xl font-bold mt-1">
            {clientsLoading ? "..." : clients.length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-text-secondary">Model AI</p>
          <p className="text-sm mt-1">
            {settings ? (
              <span className="badge-info">{settings.local_ai_model_name}</span>
            ) : (
              <span className="badge-neutral">Ładowanie...</span>
            )}
          </p>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-text-primary">Ostatnie raporty</h3>
          {reports.length > 0 && (
            <button
              onClick={() => navigate("/historia")}
              className="text-xs text-accent hover:underline"
            >
              Zobacz wszystkie
            </button>
          )}
        </div>

        {recentReports.length === 0 ? (
          <p className="text-sm text-text-secondary">
            Brak raportów. Kliknij "Nowy raport", aby rozpocząć.
          </p>
        ) : (
          <div className="space-y-2">
            {recentReports.map((report) => {
              const statusInfo = REPORT_STATUSES[report.status as keyof typeof REPORT_STATUSES] ?? {
                label: report.status,
                variant: "neutral" as const,
              };
              return (
                <div
                  key={report.id}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-bg-tertiary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium text-text-primary">
                      {getClientName(report.client_id)}
                    </span>
                    <span className="text-xs text-text-muted">
                      {formatMonth(report.reporting_month)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                    <span className="text-xs text-text-muted">
                      {formatDate(report.created_at)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
