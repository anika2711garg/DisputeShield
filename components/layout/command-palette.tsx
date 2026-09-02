"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { Command } from "cmdk";

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

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-start bg-black/50 p-4 pt-[12vh]" onClick={() => onOpenChange(false)}>
      <Command
        className="mx-auto w-full max-w-xl overflow-hidden rounded-2xl bg-surface shadow-2xl hairline"
        onClick={(event) => event.stopPropagation()}
      >
        <Command.Input
          autoFocus
          value={q}
          onValueChange={setQ}
          placeholder="Search disputes, payments, orders, customers…"
          className="h-12 w-full border-b bg-transparent px-4 text-sm outline-none"
        />
        <Command.List className="max-h-80 overflow-auto p-2">
          <Command.Group heading="Go">
            {([
              ["/dashboard", "Overview"],
              ["/disputes", "Disputes"],
              ["/disputes/disp_hero_macbook", "Hero MacBook case"],
              ["/evidence", "Evidence"],
              ["/demo", "Demo Center"],
              ["/ai-evaluation", "AI Evaluation"],
              ["/analytics", "Analytics"],
            ] as const).map(([href, label]) => (
              <Command.Item
                key={href}
                onSelect={() => go(href)}
                className="cursor-pointer rounded-lg px-3 py-2 text-sm aria-selected:bg-sunken"
              >
                {label}
              </Command.Item>
            ))}
          </Command.Group>
          {results.disputes.length > 0 && (
            <Command.Group heading="Disputes">
              {results.disputes.map((item) => (
                <Command.Item key={item.id} onSelect={() => go(`/disputes/${item.id}`)} className="cursor-pointer rounded-lg px-3 py-2 text-sm aria-selected:bg-sunken">
                  {item.id}
                </Command.Item>
              ))}
            </Command.Group>
          )}
          {results.orders.length > 0 && (
            <Command.Group heading="Orders">
              {results.orders.map((item) => (
                <Command.Item key={item.id} onSelect={() => go(item.href)} className="cursor-pointer rounded-lg px-3 py-2 text-sm aria-selected:bg-sunken">
                  {item.externalId}
                </Command.Item>
              ))}
            </Command.Group>
          )}
          {results.customers.length > 0 && (
            <Command.Group heading="Customers">
              {results.customers.map((item) => (
                <Command.Item key={item.id} onSelect={() => go(item.href)} className="cursor-pointer rounded-lg px-3 py-2 text-sm aria-selected:bg-sunken">
                  {item.name}
                </Command.Item>
              ))}
            </Command.Group>
          )}
          {results.evidence.length > 0 && (
            <Command.Group heading="Evidence">
              {results.evidence.map((item) => (
                <Command.Item key={item.id} onSelect={() => go(`/disputes/${item.disputeId}`)} className="cursor-pointer rounded-lg px-3 py-2 text-sm aria-selected:bg-sunken">
                  {item.title}
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>
      </Command>
    </div>
  );
}
