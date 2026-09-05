"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function OpsPanel() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  return (
    <Card>
      <h2 className="font-medium">Operations job</h2>
      <p className="mt-1 text-sm text-muted">
        Investigate cases that still have no AI file, and raise deadline bells. Same work as{" "}
        <code className="text-xs">npm run ops:pending</code>.
      </p>
      <Button
        className="mt-4"
        disabled={busy}
        onClick={async () => {
          setBusy(true);
          const response = await fetch("/api/jobs/process-pending", { method: "POST" });
          const data = await response.json().catch(() => ({}));
          setBusy(false);
          if (!response.ok) {
            toast.error("Job failed");
            return;
          }
          toast.success(`Investigated ${data.processed ?? 0} · deadline alerts ${data.deadlineAlerts ?? 0}`);
          router.refresh();
        }}
      >
        {busy ? "Running…" : "Run now"}
      </Button>
    </Card>
  );
}
