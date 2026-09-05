"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";

export function EmptyWorkspace({ canLoadDemo }: { canLoadDemo: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <EmptyState
      title="This workspace has no disputes yet"
      body="Point Razorpay test webhooks at POST /api/webhooks/razorpay, or load the sample Northstar desk — including the MacBook Air file — to walk the product."
      action={
        canLoadDemo ? (
          <Button
            disabled={busy}
            onClick={async () => {
              setBusy(true);
              const response = await fetch("/api/workspace/demo", { method: "POST" });
              setBusy(false);
              if (!response.ok) {
                toast.error("Could not load sample cases. They may already be in this workspace.");
                return;
              }
              const data = await response.json();
              toast.success(`Loaded ${data.disputes} sample cases`);
              router.refresh();
            }}
          >
            {busy ? "Loading sample desk…" : "Load sample cases"}
          </Button>
        ) : (
          <p className="text-sm text-muted">Ask an admin to load the sample desk or connect Razorpay.</p>
        )
      }
    />
  );
}
