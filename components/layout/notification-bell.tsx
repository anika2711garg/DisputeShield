"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { AnimatePresence, motion } from "motion/react";
import { Bell } from "lucide-react";
import { PeekTrigger } from "@/components/ui/case-peek";
import { disputeIdFromHref } from "@/lib/ui/peek";

type Item = { id: string; title: string; body: string; href?: string; read: boolean };

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [pulse, setPulse] = useState(false);

  const refresh = useCallback(() => {
    fetch("/api/notifications")
      .then((response) => response.json())
      .then((data) => setItems(data.items ?? []))
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    refresh();
    const poll = window.setInterval(refresh, 5000);
    const onRefresh = () => {
      setPulse(true);
      refresh();
      window.setTimeout(() => setPulse(false), 1200);
    };
    window.addEventListener("ds-notifications-refresh", onRefresh);
    return () => {
      window.clearInterval(poll);
      window.removeEventListener("ds-notifications-refresh", onRefresh);
    };
  }, [refresh]);

  const unread = items.filter((item) => !item.read).length;

  return (
    <div className="relative">
      <motion.button
        type="button"
        aria-label="Notifications"
        className="relative grid size-10 place-items-center rounded-[10px] bg-surface hairline"
        onClick={() => setOpen((value) => !value)}
        animate={pulse || unread > 0 ? { scale: [1, 1.08, 1] } : {}}
        transition={{ duration: 0.35 }}
      >
        <Bell className="size-4" />
        {unread > 0 && <span className="absolute right-2 top-2 size-2 rounded-full bg-danger pulse-dot" />}
      </motion.button>
      <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 6, scale: 0.98 }}
          transition={{ duration: 0.18 }}
          className="absolute right-0 mt-2 w-80 rounded-[14px] bg-surface p-2 shadow-[var(--shadow)] hairline"
        >
          <div className="px-2 py-1 text-[11px] uppercase tracking-[0.14em] text-muted">Notifications</div>
          {items.length === 0 && <div className="px-2 py-6 text-sm text-muted">You&apos;re clear for now.</div>}
          {items.slice(0, 6).map((item) => {
            const disputeId = disputeIdFromHref(item.href);
            const row = (
              <Link
                key={item.id}
                href={(item.href ?? "/disputes") as Route}
                className="block rounded-[10px] px-2 py-2 hover:bg-sunken"
                onClick={async () => {
                  await fetch("/api/notifications", { method: "POST", body: JSON.stringify({ id: item.id }) });
                  setOpen(false);
                  refresh();
                }}
              >
                <div className="text-sm font-medium">{item.title}</div>
                <div className="text-xs text-muted">{item.body}</div>
              </Link>
            );
            return disputeId ? (
              <PeekTrigger key={item.id} id={disputeId} className="block w-full">
                {row}
              </PeekTrigger>
            ) : (
              row
            );
          })}
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
