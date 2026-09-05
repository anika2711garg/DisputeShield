"use client";

import { useEffect, useState } from "react";
import { Copy } from "lucide-react";
import { toast } from "sonner";

type Preview = {
  path: string;
  method: string;
  body: Record<string, unknown>;
  reason_code: string;
  razorpay: { writeArmed: boolean; liveWrites: boolean; writesEnvEnabled: boolean };
};

export function PayloadPreview({ disputeId }: { disputeId: string }) {
  const [data, setData] = useState<Preview | null>(null);

  useEffect(() => {
    fetch(`/api/disputes/${disputeId}/contest/preview`)
      .then((response) => response.json())
      .then(setData)
      .catch(() => undefined);
  }, [disputeId]);

  if (!data) {
    return <div className="sheet rounded-[6px] p-4 text-sm text-muted">Loading Razorpay contest payload…</div>;
  }

  const json = JSON.stringify(data.body, null, 2);

  return (
    <section className="sheet flutter rounded-[6px] bg-[#241c14] p-4 text-[#f4ead8]">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-cyan-300">Razorpay contest payload</div>
          <div className="mt-1 font-mono text-xs text-slate-300">
            {data.method} {data.path}
          </div>
        </div>
        <button
          type="button"
          className="grid size-8 place-items-center rounded-md bg-white/8"
          aria-label="Copy payload"
          onClick={async () => {
            await navigator.clipboard.writeText(json);
            toast.success("Payload copied");
          }}
        >
          <Copy className="size-3.5" />
        </button>
      </div>
      <pre className="mt-3 overflow-auto rounded-[10px] bg-black/30 p-3 text-[11px] text-slate-200">{json}</pre>
      <p className="mt-3 text-xs text-slate-400">
        Reason code <span className="text-cyan-200">{data.reason_code}</span>.{" "}
        {data.razorpay.liveWrites
          ? "Armed + env writes on — this POST would hit Razorpay."
          : data.razorpay.writeArmed
            ? "Armed in UI, but ENABLE_RAZORPAY_WRITES is false — still simulated."
            : "Simulation mode. Nothing is sent until you arm writes and enable the env flag."}
      </p>
    </section>
  );
}
