"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatInr } from "@/lib/utils";
import { displayStatus, recommendationTone } from "@/lib/ui/labels";
import { statusTone } from "@/lib/ui/tones";
import { deadlineUrgency, formatRelativeTo, formatShortDate } from "@/lib/ui/dates";
import { motion } from "motion/react";
import { PeekButton, PeekTrigger } from "@/components/ui/case-peek";

const COLUMNS = [
  { id: "case", label: "Case" },
  { id: "customer", label: "Customer" },
  { id: "reason", label: "Reason" },
  { id: "amount", label: "Amount" },
  { id: "score", label: "Evidence Score" },
  { id: "ai", label: "AI Recommendation" },
  { id: "rules", label: "Rules Recommendation" },
  { id: "deadline", label: "Deadline" },
  { id: "status", label: "Status" },
  { id: "reviewer", label: "Reviewer" },
] as const;

export type DisputeTableRow = {
  id: string;
  paymentId?: string;
  customerName?: string;
  customerEmail?: string;
  amount: number;
  reason: string;
  phase: string;
  score?: number;
  aiRecommendation?: string;
  rulesRecommendation?: string;
  recommendation?: string;
  confidence?: number;
  respondBy?: string;
  status: string;
  reviewer?: string;
  razorpayDisputeId?: string;
  evidenceCount?: number;
};

const PAGE_SIZE = 10;
const STORAGE_KEY = "ds-dispute-columns-v2";

export function DisputeTable({ rows, total }: { rows: DisputeTableRow[]; total: number }) {
  const router = useRouter();
  const params = useSearchParams();
  const requested = Math.max(1, Number(params.get("page") ?? "1") || 1);
  const sort = params.get("sort") ?? "deadline";
  const dir = params.get("dir") === "asc" ? "asc" : "desc";
  const [visible, setVisible] = useState<string[]>(COLUMNS.map((column) => column.id));
  const [menu, setMenu] = useState(false);
  const [selected, setSelected] = useState<string[]>([]);
  const [bulkBusy, setBulkBusy] = useState(false);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      try {
        const parsed = JSON.parse(stored) as string[];
        if (Array.isArray(parsed) && parsed.length) setVisible(parsed);
      } catch {
        /* ignore */
      }
    }, 0);
    return () => window.clearTimeout(handle);
  }, []);

  const shown = useMemo(() => COLUMNS.filter((column) => visible.includes(column.id)), [visible]);
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(requested, pages);

  function setPage(next: number) {
    const query = new URLSearchParams(params.toString());
    if (next <= 1) query.delete("page");
    else query.set("page", String(next));
    router.push(`/disputes?${query.toString()}`);
  }

  function setSort(id: string) {
    const query = new URLSearchParams(params.toString());
    query.set("sort", id);
    query.set("dir", sort === id && dir === "desc" ? "asc" : "desc");
    query.delete("page");
    router.push(`/disputes?${query.toString()}`);
  }

  function toggle(id: string) {
    setVisible((current) => {
      const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
      const safe = next.length ? next : [id];
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(safe));
      return safe;
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-end gap-2">
        {selected.length > 0 && (
          <Button
            size="sm"
            disabled={bulkBusy}
            onClick={async () => {
              setBulkBusy(true);
              const response = await fetch("/api/disputes/bulk/investigate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ids: selected.slice(0, 8) }),
              });
              setBulkBusy(false);
              setSelected([]);
              if (!response.ok) return;
              router.refresh();
            }}
          >
            {bulkBusy ? "Investigating…" : `Investigate ${Math.min(selected.length, 8)}`}
          </Button>
        )}
        <div className="relative">
          <Button variant="outline" size="sm" onClick={() => setMenu((value) => !value)}>
            Columns
          </Button>
          {menu && (
            <div className="absolute right-0 z-10 mt-2 w-52 rounded-[12px] bg-surface p-2 shadow-[var(--shadow)] hairline">
              {COLUMNS.map((column) => (
                <label key={column.id} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm">
                  <input type="checkbox" checked={visible.includes(column.id)} onChange={() => toggle(column.id)} />
                  {column.label}
                </label>
              ))}
            </div>
          )}
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={async () => {
            const query = new URLSearchParams(params.toString());
            query.delete("page");
            const response = await fetch(`/api/disputes/export?${query.toString()}`);
            if (!response.ok) return;
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = "disputes.csv";
            link.click();
            URL.revokeObjectURL(url);
          }}
        >
          Export CSV
        </Button>
      </div>
      <div className="overflow-x-auto rounded-[14px] bg-surface hairline">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="text-[11px] uppercase tracking-[0.12em] text-muted">
            <tr>
              <th className="w-8 px-2 py-3" />
              <th className="px-3 py-3">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  checked={rows.length > 0 && selected.length === rows.length}
                  onChange={(event) => setSelected(event.target.checked ? rows.map((row) => row.id) : [])}
                />
              </th>
              {shown.map((column) => (
                <th key={column.id} className="px-4 py-3">
                  <button type="button" className="hover:text-foreground" onClick={() => setSort(column.id)}>
                    {column.label}
                    {sort === column.id ? (dir === "asc" ? " ↑" : " ↓") : ""}
                  </button>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((item, index) => (
              <motion.tr
                key={item.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.28 }}
                className="border-t transition-colors hover:bg-sunken/70"
              >
                <td className="px-2 py-3">
                  <PeekButton
                    id={item.id}
                    seed={{
                      id: item.id,
                      amount: item.amount,
                      reason: item.reason,
                      status: item.status,
                      phase: item.phase,
                      paymentId: item.paymentId,
                      customerName: item.customerName,
                      score: item.score,
                      ai: item.aiRecommendation,
                      rules: item.rulesRecommendation,
                      final: item.recommendation,
                      respondBy: item.respondBy,
                      reviewer: item.reviewer,
                    }}
                  />
                </td>
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    aria-label={`Select ${item.id}`}
                    checked={selected.includes(item.id)}
                    onChange={(event) =>
                      setSelected((current) => (event.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id)))
                    }
                  />
                </td>
                {shown.map((column) => (
                  <td key={column.id} className="px-4 py-3">
                    <Cell row={item} column={column.id} />
                  </td>
                ))}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between text-sm text-muted">
        <span>
          Page {page} of {pages}
        </span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => setPage(page + 1)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

function Cell({ row, column }: { row: DisputeTableRow; column: string }) {
  const label = displayStatus({
    status: row.status,
    phase: row.phase,
    recommendation: row.recommendation,
  });
  if (column === "case") {
    return (
      <>
        <PeekTrigger
          id={row.id}
          seed={{
            id: row.id,
            amount: row.amount,
            reason: row.reason,
            status: row.status,
            paymentId: row.paymentId,
            customerName: row.customerName,
            score: row.score,
            ai: row.aiRecommendation,
            rules: row.rulesRecommendation,
          }}
        >
          <Link href={`/disputes/${row.id}`} className="font-medium text-electric">
            {row.id}
          </Link>
        </PeekTrigger>
        <div className="text-xs text-muted">{row.paymentId}</div>
      </>
    );
  }
  if (column === "customer") {
    return (
      <PeekTrigger
        id={row.id}
        seed={{
          id: row.id,
          amount: row.amount,
          reason: row.reason,
          status: row.status,
          customerName: row.customerName,
          score: row.score,
        }}
      >
        <span>
          <div>{row.customerName ?? "—"}</div>
          <div className="text-xs text-muted">{row.customerEmail}</div>
        </span>
      </PeekTrigger>
    );
  }
  if (column === "reason") return <span className="capitalize">{row.reason}</span>;
  if (column === "amount") return formatInr(row.amount);
  if (column === "score") {
    const score = row.score ?? 0;
    const color = score >= 80 ? "bg-emerald" : score >= 50 ? "bg-amber" : "bg-danger";
    return (
      <div className="min-w-[72px]">
        <div className="tabular text-sm font-semibold">{row.score ?? "—"}</div>
        <div className="mt-1 h-1 rounded-full bg-sunken">
          <motion.div className={`h-1 rounded-full ${color}`} initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.55 }} />
        </div>
      </div>
    );
  }
  if (column === "ai") return <Badge tone={recommendationTone(row.aiRecommendation)}>{row.aiRecommendation ?? "pending"}</Badge>;
  if (column === "rules") return <Badge tone={recommendationTone(row.rulesRecommendation)}>{row.rulesRecommendation ?? "pending"}</Badge>;
  if (column === "deadline") {
    const urgency = deadlineUrgency(row.respondBy);
    return (
      <div className={urgency === "urgent" || urgency === "overdue" ? "text-danger" : urgency === "soon" ? "text-amber" : ""}>
        <div className="flex items-center gap-1.5">
          <span className={`size-1.5 rounded-full ${urgency === "urgent" || urgency === "overdue" ? "bg-danger pulse-dot" : urgency === "soon" ? "bg-amber" : "bg-emerald"}`} />
          {row.respondBy ? formatRelativeTo(row.respondBy) : "—"}
        </div>
        <div className="text-xs text-muted">{formatShortDate(row.respondBy)}</div>
      </div>
    );
  }
  if (column === "status") return <Badge tone={statusTone(label)}>{label}</Badge>;
  if (column === "reviewer") return row.reviewer ?? "Unassigned";
  return null;
}
