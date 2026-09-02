"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { ModeToggles } from "@/components/layout/mode-toggles";
import type { WorkspaceSettings } from "@/types/domain";

export function SettingsControls({
  settings,
  razorpay,
}: {
  settings: WorkspaceSettings;
  razorpay: {
    adapterMode: string;
    configured: boolean;
    writesEnvEnabled: boolean;
    writeArmed: boolean;
    liveWrites: boolean;
    keyIdMasked: string;
    webhookSecretSet: boolean;
    contestThreshold: number;
  };
}) {
  const router = useRouter();

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <h2 className="font-medium">Mode toggles</h2>
        <p className="mt-1 text-sm text-muted">Light/dark appearance and Razorpay simulation vs armed writes.</p>
        <div className="mt-4">
          <ModeToggles writeArmed={settings.writeArmed} writesEnvEnabled={razorpay.writesEnvEnabled} />
        </div>
        <p className="mt-3 text-xs text-muted">
          {razorpay.liveWrites
            ? "Live writes are on. Contest/Accept will POST to Razorpay."
            : "Contest/Accept stay simulated until both this toggle is Armed and ENABLE_RAZORPAY_WRITES=true."}
        </p>
      </Card>
      <Card>
        <h2 className="font-medium">Razorpay runtime</h2>
        <ul className="mt-3 space-y-1.5 text-sm text-muted">
          <li>Adapter: {razorpay.adapterMode}</li>
          <li>Keys: {razorpay.configured ? razorpay.keyIdMasked : "not configured — using mock adapter"}</li>
          <li>Webhook secret: {razorpay.webhookSecretSet ? "set" : "unset (mock accepts unsigned)"}</li>
          <li>Contest threshold: {razorpay.contestThreshold}</li>
        </ul>
      </Card>
      <Card>
        <h2 className="font-medium">Auto-assign</h2>
        <p className="mt-1 text-sm text-muted">New webhook cases can jump the assignment queue.</p>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            defaultChecked={settings.autoAssign}
            onChange={async (event) => {
              await fetch("/api/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ autoAssign: event.target.checked }),
              });
              toast.success("Saved");
              router.refresh();
            }}
          />
          Offer Claim next on every new dispute
        </label>
      </Card>
    </div>
  );
}
