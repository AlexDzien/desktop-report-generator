import { useState, useEffect, useCallback } from "react";
import type { Client } from "@/lib/types";
import * as api from "@/hooks/useApi";

export function useClients() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getClients();
      setClients(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nie udało się załadować klientów");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const addClient = useCallback(
    async (input: Parameters<typeof api.createClient>[0]) => {
      const id = await api.createClient(input);
      await fetchClients();
      return id;
    },
    [fetchClients],
  );

  const editClient = useCallback(
    async (input: Parameters<typeof api.updateClient>[0]) => {
      await api.updateClient(input);
      await fetchClients();
    },
    [fetchClients],
  );

  const removeClient = useCallback(
    async (id: string) => {
      await api.deleteClient(id);
      await fetchClients();
    },
    [fetchClients],
  );

  return { clients, loading, error, addClient, editClient, removeClient, refresh: fetchClients };
}
