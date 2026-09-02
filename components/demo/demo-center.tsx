"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ACTIONS = [
  ["strong", "Replay Strong Dispute"],
  ["weak", "Replay Weak Dispute"],
  ["conflict", "Replay Conflicting Evidence"],
  ["refunded", "Replay Refunded Order"],
  ["service", "Replay Service Dispute"],
  ["random", "Generate Random Dispute"],
] as const;

export function DemoCenter() {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {ACTIONS.map(([id, label]) => (
        <Button
          key={id}
          variant="secondary"
          className="h-auto justify-start py-4"
          disabled={Boolean(busy)}
          onClick={async () => {
            setBusy(id);
            const response = await fetch("/api/demo/replay", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ scenario: id }),
            });
            const data = await response.json();
            setBusy(null);
            if (!response.ok) {
              toast.error("Replay failed");
              return;
            }
            toast.success("SIMULATED EVENT ingested — opening the new case.");
            window.dispatchEvent(new Event("ds-notifications-refresh"));
            if (data.disputeId) {
              window.setTimeout(() => router.push(`/disputes/${data.disputeId}`), 700);
            } else {
              router.refresh();
            }
          }}
        >
          <span>
            <span className="block text-xs uppercase text-amber">Simulated event</span>
            {label}
          </span>
        </Button>
      ))}
    </div>
  );
}
