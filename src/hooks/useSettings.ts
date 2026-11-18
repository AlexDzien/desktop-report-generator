import { useState, useEffect, useCallback } from "react";
import type { Settings } from "@/lib/types";
import type { SettingsInput } from "@/lib/validations";
import * as api from "@/hooks/useApi";

export function useSettings() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getSettings();
      setSettings(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Nie udało się załadować ustawień");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const editSettings = useCallback(
    async (input: Partial<SettingsInput>) => {
      await api.updateSettings(input);
      await fetchSettings();
    },
    [fetchSettings],
  );

  return { settings, loading, error, editSettings, refresh: fetchSettings };
}
