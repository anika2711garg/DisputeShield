import type { AppStore } from "@/types/domain";

const CLOSED = new Set(["won", "lost", "closed", "accepted"]);

export function rebaseOpenDeadlines(store: AppStore, now = Date.now()): boolean {
  const open = (store.disputes ?? []).filter((item) => item.respondBy && !CLOSED.has(item.status));
  if (!open.length) return false;
  const latest = Math.max(...open.map((item) => new Date(item.respondBy as string).getTime()));
  if (latest >= now - 12 * 3_600_000) return false;
  const delta = now + 36 * 3_600_000 - latest;
  for (const item of open) {
    item.respondBy = new Date(new Date(item.respondBy as string).getTime() + delta).toISOString();
  }
  return true;
}
