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
      className="fixed inset-0 z-50 grid place-items-start bg-[#241c14]/40 p-4 pt-[12vh]"
      onClick={() => onOpenChange(false)}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div initial={{ opacity: 0, y: 16, rotate: -1.2 }} animate={{ opacity: 1, y: 0, rotate: -0.3 }} exit={{ opacity: 0, y: 8, rotate: 0.6 }} transition={{ duration: 0.28 }}>
      <Command
        className="sheet mx-auto w-full max-w-xl overflow-hidden rounded-[6px] bg-[#fff8ee] text-foreground"
        onClick={(event) => event.stopPropagation()}
      >
        <Command.Input
          autoFocus
          value={q}
          onValueChange={setQ}
          placeholder="Search disputes, navigate, open the hero case…"
          className="h-12 w-full border-b border-[var(--border)] bg-transparent px-4 text-sm outline-none placeholder:text-muted"
        />
        <Command.List className="max-h-80 overflow-auto p-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2 [&_[cmdk-group-heading]]:font-[var(--font-hand)] [&_[cmdk-group-heading]]:text-lg [&_[cmdk-group-heading]]:text-violet">
          <Command.Group heading="go">
            {GO.map(([href, label]) => (
              <Command.Item
                key={href}
                onSelect={() => go(href)}
                className="row-ink cursor-pointer rounded-[4px] px-3 py-2 text-sm aria-selected:bg-violet/10"
              >
                {label}
              </Command.Item>
            ))}
          </Command.Group>
          {results.disputes.length > 0 && (
            <Command.Group heading="disputes">
              {results.disputes.map((item) => (
                <Command.Item key={item.id} onSelect={() => go(`/disputes/${item.id}`)} className="row-ink cursor-pointer rounded-[4px] px-3 py-2 text-sm aria-selected:bg-violet/10">
                  <PeekTrigger id={item.id}>
                    <span>{item.id}</span>
                  </PeekTrigger>
                </Command.Item>
              ))}
            </Command.Group>
          )}
          {results.orders.length > 0 && (
            <Command.Group heading="orders">
              {results.orders.map((item) => (
                <Command.Item key={item.id} onSelect={() => go(item.href)} className="row-ink cursor-pointer rounded-[4px] px-3 py-2 text-sm aria-selected:bg-violet/10">
                  {item.externalId}
                </Command.Item>
              ))}
            </Command.Group>
          )}
          {results.customers.length > 0 && (
            <Command.Group heading="customers">
              {results.customers.map((item) => (
                <Command.Item key={item.id} onSelect={() => go(item.href)} className="row-ink cursor-pointer rounded-[4px] px-3 py-2 text-sm aria-selected:bg-violet/10">
                  {item.name}
                </Command.Item>
              ))}
            </Command.Group>
          )}
          {results.evidence.length > 0 && (
            <Command.Group heading="evidence">
              {results.evidence.map((item) => (
                <Command.Item key={item.id} onSelect={() => go(`/disputes/${item.disputeId}`)} className="row-ink cursor-pointer rounded-[4px] px-3 py-2 text-sm aria-selected:bg-violet/10">
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
