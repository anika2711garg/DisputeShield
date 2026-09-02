"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Bell } from "lucide-react";

type Item = { id: string; title: string; body: string; href?: string; read: boolean };

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);

  const refresh = useCallback(() => {
    fetch("/api/notifications")
      .then((response) => response.json())
      .then((data) => setItems(data.items ?? []))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    refresh();
    const poll = window.setInterval(refresh, 5000);
    window.addEventListener("ds-notifications-refresh", refresh);
    return () => {
      window.clearInterval(poll);
      window.removeEventListener("ds-notifications-refresh", refresh);
    };
  }, [refresh]);

  const unread = items.filter((item) => !item.read).length;

  return (
    <div className="relative">
      <button type="button" aria-label="Notifications" className="relative grid size-10 place-items-center rounded-lg hairline" onClick={() => setOpen((value) => !value)}>
        <Bell className="size-4" />
        {unread > 0 && <span className="absolute right-2 top-2 size-2 rounded-full bg-danger" />}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl bg-surface p-2 shadow-2xl hairline">
          <div className="px-2 py-1 text-xs uppercase tracking-wide text-muted">Notifications</div>
          {items.length === 0 && <div className="px-2 py-6 text-sm text-muted">You&apos;re clear for now.</div>}
          {items.slice(0, 6).map((item) => (
            <Link
              key={item.id}
              href={(item.href ?? "/disputes") as Route}
              className="block rounded-lg px-2 py-2 hover:bg-sunken"
              onClick={async () => {
                await fetch("/api/notifications", { method: "POST", body: JSON.stringify({ id: item.id }) });
                setOpen(false);
                refresh();
              }}
            >
              <div className="text-sm font-medium">{item.title}</div>
              <div className="text-xs text-muted">{item.body}</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
