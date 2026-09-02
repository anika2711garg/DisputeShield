"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";

const VIEWS = [
  ["all", "All"],
  ["needs-attention", "Needs attention"],
  ["contest-ready", "Contest ready"],
  ["human-review", "Human review"],
  ["under-review", "Under review"],
  ["won", "Won"],
  ["lost", "Lost"],
  ["disagreement", "AI ≠ rules"],
  ["unassigned", "Unassigned"],
];

export function DisputeFilters() {
  const router = useRouter();
  const params = useSearchParams();
  const view = params.get("view") ?? "all";

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete("page");
    router.push(`/disputes?${next.toString()}`);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {VIEWS.map((viewItem) => {
          const id = viewItem[0];
          const label = viewItem[1];
          if (!id || !label) return null;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setParam("view", id === "all" ? "" : id)}
              className={`rounded-full px-3 py-1 text-xs tracking-wide hairline ${view === id || (id === "all" && !params.get("view")) ? "bg-cyan text-white" : "bg-white"}`}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div className="grid gap-2 md:grid-cols-5">
        <Input
          key={params.get("q") ?? ""}
          placeholder="Search ID, payment, customer"
          defaultValue={params.get("q") ?? ""}
          onBlur={(e) => setParam("q", e.target.value)}
        />
        <select className="h-10 rounded-[10px] bg-white px-3 text-sm hairline" defaultValue={params.get("status") ?? ""} onChange={(e) => setParam("status", e.target.value)}>
          <option value="">All statuses</option>
          {["open", "action_required", "under_review", "won", "lost", "accepted"].map((s) => (
            <option key={s} value={s}>{s.replaceAll("_", " ")}</option>
          ))}
        </select>
        <select className="h-10 rounded-[10px] bg-white px-3 text-sm hairline" defaultValue={params.get("reason") ?? ""} onChange={(e) => setParam("reason", e.target.value)}>
          <option value="">All reasons</option>
          {["product_not_received", "transaction_not_recognised", "service_not_provided", "refund_not_received", "product_not_as_described"].map((s) => (
            <option key={s} value={s}>{s.replaceAll("_", " ")}</option>
          ))}
        </select>
        <select className="h-10 rounded-[10px] bg-white px-3 text-sm hairline" defaultValue={params.get("minScore") ?? ""} onChange={(e) => setParam("minScore", e.target.value)}>
          <option value="">Score: any</option>
          <option value="80">80+</option>
          <option value="50">50+</option>
          <option value="0">0+</option>
        </select>
        <select className="h-10 rounded-[10px] bg-white px-3 text-sm hairline" defaultValue={params.get("range") ?? ""} onChange={(e) => setParam("range", e.target.value)}>
          <option value="">Any date</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
        </select>
      </div>
    </div>
  );
}
