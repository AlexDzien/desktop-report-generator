import { useState, useEffect, useCallback } from "react";
import type { Report } from "@/lib/types";
import * as api from "@/hooks/useApi";

export function useReports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getReports();
      setReports(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nie udało się załadować raportów");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const addReport = useCallback(
    async (input: Parameters<typeof api.createReport>[0]) => {
      const id = await api.createReport(input);
      await fetchReports();
      return id;
    },
    [fetchReports],
  );

  const editReport = useCallback(
    async (input: Parameters<typeof api.updateReport>[0]) => {
      await api.updateReport(input);
      await fetchReports();
    },
    [fetchReports],
  );

  const removeReport = useCallback(
    async (id: string) => {
      await api.deleteReport(id);
      await fetchReports();
    },
    [fetchReports],
  );

  return { reports, loading, error, addReport, editReport, removeReport, refresh: fetchReports };
}
