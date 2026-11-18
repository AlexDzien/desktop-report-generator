import { MONTH_NAMES_PL } from "./constants";

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("pl-PL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split("-");
  const monthIndex = parseInt(month, 10) - 1;
  return `${MONTH_NAMES_PL[monthIndex]} ${year}`;
}

export function getCurrentMonth(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildPdfFileName(clientName: string, month: string): string {
  const slug = slugify(clientName);
  return `raport-google-ads-${slug}-${month}.pdf`;
}

export function buildPdfPath(
  baseFolder: string,
  clientName: string,
  month: string,
): string {
  const slug = slugify(clientName);
  return `${baseFolder}/${slug}/${month}/${buildPdfFileName(clientName, month)}`;
}

export function generateId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}
