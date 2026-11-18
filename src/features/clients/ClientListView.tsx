import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { ClientForm } from "./ClientForm";
import { useClients } from "@/hooks/useClients";
import type { Client } from "@/lib/types";

export function ClientListView() {
  const { clients, loading, error, addClient, editClient, removeClient, refresh } = useClients();
  const [showForm, setShowForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const handleAdd = async (data: Parameters<typeof addClient>[0]) => {
    await addClient(data);
    setShowForm(false);
  };

  const handleEdit = async (data: { name: string; contact_name?: string | null; contact_email?: string | null; industry?: string | null; notes?: string | null; default_reports_folder?: string | null }) => {
    if (editingClient) {
      await editClient({ ...data, id: editingClient.id });
      setEditingClient(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Czy na pewno chcesz usunąć tego klienta?")) {
      await removeClient(id);
    }
  };

  if (loading) return <Spinner text="Ładowanie klientów..." />;
  if (error) return <ErrorState message={error} onRetry={refresh} />;

  return (
    <div>
      <PageHeader
        title="Klienci"
        subtitle={`${clients.length} klientów`}
        actions={
          <button className="btn-primary" onClick={() => { setShowForm(true); setEditingClient(null); }}>
            + Nowy klient
          </button>
        }
      />

      {showForm && (
        <div className="card mb-6">
          <h3 className="font-medium text-text-primary mb-3">Nowy klient</h3>
          <ClientForm onSubmit={handleAdd} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {editingClient && (
        <div className="card mb-6">
          <h3 className="font-medium text-text-primary mb-3">Edytuj klienta</h3>
          <ClientForm
            initialData={editingClient}
            onSubmit={handleEdit}
            onCancel={() => setEditingClient(null)}
          />
        </div>
      )}

      {clients.length === 0 && !showForm && !editingClient ? (
        <EmptyState
          icon="👥"
          title="Brak klientów"
          description="Dodaj pierwszego klienta, aby rozpocząć tworzenie raportów."
          action={
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              + Dodaj klienta
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <div key={client.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-text-primary truncate">{client.name}</h3>
                  {client.contact_name && (
                    <p className="text-sm text-text-secondary mt-0.5">{client.contact_name}</p>
                  )}
                  {client.industry && (
                    <p className="text-xs text-text-muted mt-1">{client.industry}</p>
                  )}
                  {client.contact_email && (
                    <p className="text-xs text-text-muted mt-1">{client.contact_email}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                <button
                  onClick={() => { setEditingClient(client); setShowForm(false); }}
                  className="text-xs text-text-secondary hover:text-accent transition-colors"
                >
                  Edytuj
                </button>
                <button
                  onClick={() => handleDelete(client.id)}
                  className="text-xs text-text-secondary hover:text-error transition-colors"
                >
                  Usuń
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
