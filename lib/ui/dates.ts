export function formatAbsolute(iso?: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatShortDate(iso?: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso.slice(0, 10);
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(date);
}

export function formatRelativeTo(iso: string, now = Date.now()): string {
  const delta = new Date(iso).getTime() - now;
  const abs = Math.abs(delta);
  const minutes = Math.round(abs / 60_000);
  const hours = Math.round(abs / 3_600_000);
  const days = Math.round(abs / 86_400_000);
  const phrase =
    days >= 2 ? `${days}d` : hours >= 2 ? `${hours}h` : minutes >= 1 ? `${minutes}m` : "now";
  if (delta >= 0) return `in ${phrase}`;
  return `${phrase} ago`;
}

export function deadlineUrgency(iso?: string | null, now = Date.now()): "none" | "ok" | "soon" | "urgent" | "overdue" {
  if (!iso) return "none";
  const remaining = new Date(iso).getTime() - now;
  if (remaining <= 0) return "overdue";
  if (remaining < 6 * 3_600_000) return "urgent";
  if (remaining < 24 * 3_600_000) return "soon";
  return "ok";
}
