"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { formatInr } from "@/lib/utils";
import { formatRelativeTo } from "@/lib/ui/dates";
import { PeekButton, PeekTrigger } from "@/components/ui/case-peek";

type Row = {
  id: string;
  customerName?: string;
  amount: number;
  reason: string;
  score?: number;
  deadline?: string;
  status: string;
  assigneeId?: string;
  assigneeName?: string;
  disagree: boolean;
};

export function AssignmentQueue({
  unassigned,
  assigned,
  reviewers,
  me,
}: {
  unassigned: Row[];
  assigned: Row[];
  reviewers: { id: string; name: string; role: string }[];
  me: string;
}) {
  const router = useRouter();

  async function assign(disputeId: string, assigneeId: string | null) {
    const response = await fetch("/api/queue/assign", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ disputeId, assigneeId }),
    });
    if (!response.ok) {
      toast.error("Assign failed");
      return;
    }
    toast.success(assigneeId ? "Assigned" : "Unassigned");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={async () => {
            const response = await fetch("/api/queue/assign", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ claim: true }),
            });
            const data = await response.json();
            if (!data.claimed) {
              toast.message("Queue is empty");
              return;
            }
            toast.success("Claimed the next deadline");
            router.push(`/disputes/${data.claimed}`);
          }}
        >
          Claim next deadline
        </Button>
      </div>
      <section>
        <h2 className="text-sm font-medium">Unassigned ({unassigned.length})</h2>
        <div className="mt-3 space-y-2">
          {unassigned.length === 0 && <p className="text-sm text-muted">Every open file has an owner.</p>}
          {unassigned.map((item) => (
            <RowCard key={item.id} item={item} reviewers={reviewers} onAssign={assign} me={me} />
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-sm font-medium">Assigned ({assigned.length})</h2>
        <div className="mt-3 space-y-2">
          {assigned.map((item) => (
            <RowCard key={item.id} item={item} reviewers={reviewers} onAssign={assign} me={me} />
          ))}
        </div>
      </section>
    </div>
  );
}

function RowCard({
  item,
  reviewers,
  onAssign,
  me,
}: {
  item: Row;
  reviewers: { id: string; name: string; role: string }[];
  onAssign: (id: string, assigneeId: string | null) => void;
  me: string;
}) {
  return (
    <article className="flex flex-wrap items-center justify-between gap-3 rounded-[14px] bg-surface px-4 py-3 hairline">
      <div className="flex items-start gap-2">
        <PeekButton
          id={item.id}
          seed={{
            id: item.id,
            amount: item.amount,
            reason: item.reason,
            status: item.status,
            customerName: item.customerName,
            score: item.score,
            respondBy: item.deadline,
            reviewer: item.assigneeName,
          }}
        />
        <div>
        <PeekTrigger
          id={item.id}
          seed={{
            id: item.id,
            amount: item.amount,
            reason: item.reason,
            status: item.status,
            customerName: item.customerName,
            score: item.score,
            respondBy: item.deadline,
            reviewer: item.assigneeName,
          }}
        >
          <Link href={`/disputes/${item.id}`} className="font-medium text-electric">
            {item.customerName ?? item.id}
          </Link>
        </PeekTrigger>
        <div className="text-xs text-muted">
          {formatInr(item.amount)} · {item.reason}
          {item.deadline ? ` · ${formatRelativeTo(item.deadline)}` : ""}
          {item.disagree ? " · AI ≠ rules" : ""}
        </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <select
          className="h-9 rounded-[10px] bg-white px-2 text-xs hairline"
          value={item.assigneeId ?? ""}
          onChange={(event) => onAssign(item.id, event.target.value || null)}
        >
          <option value="">Unassigned</option>
          {reviewers.map((reviewer) => (
            <option key={reviewer.id} value={reviewer.id}>
              {reviewer.name}
              {reviewer.id === me ? " (you)" : ""}
            </option>
          ))}
        </select>
      </div>
    </article>
  );
}
