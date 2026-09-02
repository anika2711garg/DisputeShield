"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatInr } from "@/lib/utils";
import { recommendationTone, statusTone } from "@/lib/ui/tones";

const COLUMNS = [
  { id: "dispute", label: "Dispute" },
  { id: "customer", label: "Customer" },
  { id: "amount", label: "Amount" },
  { id: "reason", label: "Reason" },
  { id: "phase", label: "Phase" },
  { id: "evidence", label: "Evidence" },
  { id: "recommendation", label: "Recommendation" },
  { id: "confidence", label: "Confidence" },
  { id: "respondBy", label: "Respond by" },
  { id: "status", label: "Status" },
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
  recommendation?: string;
  confidence?: number;
  respondBy?: string;
  status: string;
};

const PAGE_SIZE = 10;
const STORAGE_KEY = "ds-dispute-columns";

export function DisputeTable({ rows, total }: { rows: DisputeTableRow[]; total: number }) {
  const router = useRouter();
  const params = useSearchParams();
  const requested = Math.max(1, Number(params.get("page") ?? "1") || 1);
  const [visible, setVisible] = useState<string[]>(COLUMNS.map((column) => column.id));
  const [menu, setMenu] = useState(false);

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
        <div className="relative">
          <Button variant="outline" size="sm" onClick={() => setMenu((value) => !value)}>
            Columns
          </Button>
          {menu && (
            <div className="absolute right-0 z-10 mt-2 w-48 rounded-xl bg-surface p-2 shadow-2xl hairline">
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
      <div className="overflow-x-auto rounded-2xl bg-surface hairline">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="text-xs uppercase tracking-wide text-muted">
            <tr>
              {shown.map((column) => (
                <th key={column.id} className="px-4 py-3">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((item) => (
              <tr key={item.id} className="border-t hover:bg-sunken/60">
                {shown.map((column) => (
                  <td key={column.id} className="px-4 py-3">
                    <Cell row={item} column={column.id} />
                  </td>
                ))}
              </tr>
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
  if (column === "dispute") {
    return (
      <>
        <Link href={`/disputes/${row.id}`} className="font-medium text-cyan">
          {row.id}
        </Link>
        <div className="text-xs text-muted">{row.paymentId}</div>
      </>
    );
  }
  if (column === "customer") {
    return (
      <>
        <div>{row.customerName ?? "—"}</div>
        <div className="text-xs text-muted">{row.customerEmail}</div>
      </>
    );
  }
  if (column === "amount") return formatInr(row.amount);
  if (column === "reason") return <span className="capitalize">{row.reason}</span>;
  if (column === "phase") return row.phase;
  if (column === "evidence") return row.score ?? "—";
  if (column === "recommendation") {
    return <Badge tone={recommendationTone(row.recommendation)}>{row.recommendation ?? "pending"}</Badge>;
  }
  if (column === "confidence") return row.confidence !== undefined ? `${Math.round(row.confidence * 100)}%` : "—";
  if (column === "respondBy") return row.respondBy ? row.respondBy.slice(5, 16).replace("T", " ") : "—";
  if (column === "status") return <Badge tone={statusTone(row.status)}>{row.status}</Badge>;
  return null;
}
