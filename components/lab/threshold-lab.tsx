"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { recommendationLabel } from "@/lib/ui/labels";
import { PeekLink } from "@/components/ui/case-peek";

type Result = {
  contestThreshold: number;
  contest: number;
  accept: number;
  review: number;
  flipped: number;
  disagreements: number;
  rows: {
    id: string;
    customerName?: string;
    amount?: number;
    score: number;
    current: string;
    next: string;
    flipped: boolean;
    disagree: boolean;
  }[];
};

export function ThresholdLab({ initial }: { initial: number }) {
  const router = useRouter();
  const [threshold, setThreshold] = useState(initial);
  const [data, setData] = useState<Result | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      fetch(`/api/lab/threshold?score=${threshold}`)
        .then((response) => response.json())
        .then(setData)
        .catch(() => undefined);
    }, 120);
    return () => window.clearTimeout(handle);
  }, [threshold]);

  return (
    <div className="space-y-5">
      <div className="sheet flutter rounded-[6px] bg-gradient-to-br from-violet/10 to-surface p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet">Rules lab</div>
            <p className="mt-1 text-sm text-muted">Contest if evidence score ≥ {threshold}. No Razorpay write. No extra AI call.</p>
          </div>
          <Button
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              await fetch("/api/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contestThreshold: threshold }),
              });
              setSaving(false);
              router.refresh();
            }}
          >
            Save as workspace threshold
          </Button>
        </div>
        <input
          type="range"
          min={50}
          max={95}
          value={threshold}
          onChange={(event) => setThreshold(Number(event.target.value))}
          className="mt-5 w-full accent-[var(--violet)]"
        />
        {data && (
          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <Stat label="Would contest" value={data.contest} />
            <Stat label="Human review" value={data.review} />
            <Stat label="Would accept" value={data.accept} />
            <Stat label="Flips vs current" value={data.flipped} />
          </div>
        )}
      </div>
      {data && (
        <div className="sheet overflow-x-auto rounded-[6px]">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-[10px] uppercase tracking-[0.14em] text-muted">
              <tr>
                <th className="px-4 py-3">Case</th>
                <th>Score</th>
                <th>Current</th>
                <th>At {threshold}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.rows.slice(0, 20).map((row) => (
                <tr key={row.id} className="row-ink border-t">
                  <td className="px-4 py-2.5">
                    <PeekLink id={row.id} className="text-electric">
                      {row.customerName ?? row.id}
                    </PeekLink>
                    {row.disagree && <span className="ml-2 text-[10px] text-violet">AI ≠ rules</span>}
                  </td>
                  <td className="tabular">{row.score}</td>
                  <td>{recommendationLabel(row.current)}</td>
                  <td className={row.flipped ? "font-medium text-amber" : ""}>{recommendationLabel(row.next)}</td>
                  <td className="text-xs text-muted">{row.flipped ? "flips" : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="ticket rounded-[4px] bg-white px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.14em] text-muted">{label}</div>
      <div className="mt-1 text-2xl font-semibold tabular">{value}</div>
    </div>
  );
}
