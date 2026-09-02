import "server-only";

import { createId } from "@/lib/db/ids";
import { getStore, saveStore } from "@/lib/db/local-store";
import type { Notification } from "@/types/domain";

export function notify(input: Omit<Notification, "id" | "read" | "createdAt"> & { read?: boolean }): Notification {
  const item: Notification = {
    id: createId("ntf"),
    read: input.read ?? false,
    createdAt: new Date().toISOString(),
    ...input,
  };
  saveStore((store) => {
    store.notifications.unshift(item);
  });
  return item;
}

export function listNotifications(organizationId: string): Notification[] {
  return getStore()
    .notifications.filter((item) => item.organizationId === organizationId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function markNotificationRead(id: string, organizationId: string): void {
  saveStore((store) => {
    const item = store.notifications.find((row) => row.id === id && row.organizationId === organizationId);
    if (item) item.read = true;
  });
}
