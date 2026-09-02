"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function RunEvaluationButton() {
  const router = useRouter();
  return (
    <Button
      onClick={async () => {
        const response = await fetch("/api/evaluation/run", { method: "POST" });
        if (!response.ok) toast.error("Could not run evaluation");
        else {
          toast.success("Held-out evaluation completed");
          router.refresh();
        }
      }}
    >
      Re-run held-out set
    </Button>
  );
}
