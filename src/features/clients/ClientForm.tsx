import { useState } from "react";
import type { Client } from "@/lib/types";
import type { ClientInput } from "@/lib/validations";

interface ClientFormProps {
  initialData?: Client;
  onSubmit: (data: ClientInput) => Promise<void>;
  onCancel: () => void;
}

export function ClientForm({ initialData, onSubmit, onCancel }: ClientFormProps) {
  const [form, setForm] = useState<ClientInput>({
    name: initialData?.name ?? "",
    contact_name: initialData?.contact_name ?? null,
    contact_email: initialData?.contact_email ?? null,
    industry: initialData?.industry ?? null,
    notes: initialData?.notes ?? null,
    default_reports_folder: initialData?.default_reports_folder ?? null,
  });
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (form.name.length < 2) {
      newErrors.name = "Nazwa musi mieć co najmniej 2 znaki";
    }
    if (form.contact_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contact_email)) {
      newErrors.contact_email = "Nieprawidłowy format email";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSaving(true);
      setErrors({});
      await onSubmit(form);
      onCancel();
    } catch (e) {
      setErrors({ submit: e instanceof Error ? e.message : "Błąd zapisu" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">
          Nazwa firmy *
        </label>
        <input
          type="text"
          className="input-field"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="np. Firma ABC"
        />
        {errors.name && <p className="text-xs text-error mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">
          Osoba kontaktowa
        </label>
        <input
          type="text"
          className="input-field"
          value={form.contact_name ?? ""}
          onChange={(e) => setForm({ ...form, contact_name: e.target.value || null })}
          placeholder="np. Jan Kowalski"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">
          Email kontaktowy
        </label>
        <input
          type="email"
          className="input-field"
          value={form.contact_email ?? ""}
          onChange={(e) => setForm({ ...form, contact_email: e.target.value || null })}
          placeholder="jan@firma.pl"
        />
        {errors.contact_email && (
          <p className="text-xs text-error mt-1">{errors.contact_email}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">
          Branża
        </label>
        <input
          type="text"
          className="input-field"
          value={form.industry ?? ""}
          onChange={(e) => setForm({ ...form, industry: e.target.value || null })}
          placeholder="np. E-commerce"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1">
          Notatki
        </label>
        <textarea
          className="textarea-field"
          value={form.notes ?? ""}
          onChange={(e) => setForm({ ...form, notes: e.target.value || null })}
          placeholder="Dodatkowe informacje o kliencie..."
          rows={3}
        />
      </div>

      {errors.submit && <p className="text-sm text-error">{errors.submit}</p>}

      <div className="flex items-center gap-2 pt-2">
        <button type="submit" disabled={saving} className="btn-primary text-sm">
          {saving ? "Zapisywanie..." : initialData ? "Zapisz zmiany" : "Dodaj klienta"}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary text-sm">
          Anuluj
        </button>
      </div>
    </form>
  );
}
