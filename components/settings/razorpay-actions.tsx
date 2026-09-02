"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function RazorpayActions() {
  const router = useRouter();
  return (
    <div className="mt-4 flex flex-wrap gap-2">
      <Button
        onClick={async () => {
          const response = await fetch("/api/razorpay/sync", { method: "POST" });
          const data = await response.json();
          if (!response.ok) {
            toast.error("Sync failed");
            return;
          }
          toast.success(`Pulled ${data.pulled} disputes · ${data.created} new`);
          window.dispatchEvent(new Event("ds-notifications-refresh"));
          router.refresh();
        }}
      >
        Sync disputes from Razorpay
      </Button>
      <Button variant="outline" onClick={() => router.push("/webhooks")}>
        Open webhook inbox
      </Button>
    </div>
  );
}
