"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { AnimatePresence, motion } from "motion/react";
import { Command } from "cmdk";
import { PeekTrigger } from "@/components/ui/case-peek";

const GO = [
  ["/dashboard", "Dashboard"],
  ["/disputes", "Disputes"],
  ["/disputes/disp_hero_macbook", "Hero MacBook case"],
  ["/orders", "Orders"],
  ["/customers", "Customers"],
  ["/evidence", "Evidence"],
  ["/analytics", "Analytics"],
  ["/demo", "Demo Center"],
  ["/queue", "Assignment queue"],
  ["/webhooks", "Razorpay webhooks"],
  ["/lab", "Contest threshold lab"],
  ["/ai-evaluation", "AI Evaluation"],
  ["/activity", "Activity"],
  ["/docs", "Documentation"],
  ["/settings", "Settings"],
  ["/settings/team", "Team"],
  ["/settings/password", "Password"],
] as const;

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState<{
    disputes: { id: string }[];
    orders: { id: string; externalId: string; href: string }[];
    customers: { id: string; name: string; href: string }[];
    evidence: { id: string; title: string; disputeId: string }[];
  }>({ disputes: [], orders: [], customers: [], evidence: [] });

  useEffect(() => {
    if (!open || q.length < 2) {
      const handle = window.setTimeout(() => {
        setResults({ disputes: [], orders: [], customers: [], evidence: [] });
      }, 0);
      return () => window.clearTimeout(handle);
    }
    const handle = window.setTimeout(async () => {
      const response = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      if (response.ok) setResults(await response.json());
    }, 180);
    return () => window.clearTimeout(handle);
  }, [q, open]);

  function go(href: string) {
    router.push(href as Route);
    onOpenChange(false);
  }

  return (
    <AnimatePresence>
      {open && (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-start bg-slate-900/45 p-4 pt-[12vh]"
      onClick={() => onOpenChange(false)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div initial={{ opacity: 0, y: 12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }} transition={{ duration: 0.2 }}>
      <Command
        className="mx-auto w-full max-w-xl overflow-hidden rounded-[16px] bg-[#101828] text-white shadow-[0_24px_60px_rgba(16,24,40,0.35)]"
        onClick={(event) => event.stopPropagation()}
      >
        <Command.Input
          autoFocus
          value={q}
          onValueChange={setQ}
          placeholder="Search disputes, navigate, open the hero case…"
          className="h-12 w-full border-b border-white/10 bg-transparent px-4 text-sm text-white outline-none placeholder:text-slate-400"
        />
        <Command.List className="max-h-80 overflow-auto p-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:text-[10px] [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-[0.16em] [&_[cmdk-group-heading]]:text-slate-400">
          <Command.Group heading="Go">
            {GO.map(([href, label]) => (
              <Command.Item
                key={href}
                onSelect={() => go(href)}
                className="cursor-pointer rounded-[10px] px-3 py-2 text-sm text-slate-100 aria-selected:bg-white/8"
              >
                {label}
              </Command.Item>
            ))}
          </Command.Group>
          {results.disputes.length > 0 && (
            <Command.Group heading="Disputes">
              {results.disputes.map((item) => (
                <Command.Item key={item.id} onSelect={() => go(`/disputes/${item.id}`)} className="cursor-pointer rounded-[10px] px-3 py-2 text-sm aria-selected:bg-white/8">
                  <PeekTrigger id={item.id}>
                    <span>{item.id}</span>
                  </PeekTrigger>
                </Command.Item>
              ))}
            </Command.Group>
          )}
          {results.orders.length > 0 && (
            <Command.Group heading="Orders">
              {results.orders.map((item) => (
                <Command.Item key={item.id} onSelect={() => go(item.href)} className="cursor-pointer rounded-[10px] px-3 py-2 text-sm aria-selected:bg-white/8">
                  {item.externalId}
                </Command.Item>
              ))}
            </Command.Group>
          )}
          {results.customers.length > 0 && (
            <Command.Group heading="Customers">
              {results.customers.map((item) => (
                <Command.Item key={item.id} onSelect={() => go(item.href)} className="cursor-pointer rounded-[10px] px-3 py-2 text-sm aria-selected:bg-white/8">
                  {item.name}
                </Command.Item>
              ))}
            </Command.Group>
          )}
          {results.evidence.length > 0 && (
            <Command.Group heading="Evidence">
              {results.evidence.map((item) => (
                <Command.Item key={item.id} onSelect={() => go(`/disputes/${item.disputeId}`)} className="cursor-pointer rounded-[10px] px-3 py-2 text-sm aria-selected:bg-white/8">
                  <PeekTrigger id={item.disputeId}>
                    <span>{item.title}</span>
                  </PeekTrigger>
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>
      </Command>
      </motion.div>
    </motion.div>
      )}
    </AnimatePresence>
  );
}
