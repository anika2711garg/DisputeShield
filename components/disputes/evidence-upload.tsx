"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { EVIDENCE_TYPES, type EvidenceType } from "@/types/domain";
import { Button } from "@/components/ui/button";

export function EvidenceUpload({ disputeId }: { disputeId: string }) {
  const router = useRouter();
  const [type, setType] = useState<EvidenceType>("delivery_confirmation");
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);

  async function upload(file: File) {
    setBusy(true);
    const form = new FormData();
    form.set("file", file);
    form.set("disputeId", disputeId);
    form.set("type", type);
    const response = await fetch("/api/evidence/upload", { method: "POST", body: form });
    setBusy(false);
    if (!response.ok) {
      toast.error("Upload failed. Use PDF, JPG, or PNG under 12MB.");
      return;
    }
    toast.success("Stored privately. This is not a Razorpay document yet.");
    router.refresh();
  }

  return (
    <div
      className={`sheet rounded-[6px] border border-dashed p-5 ${drag ? "border-cyan bg-cyan/5" : "border-[var(--border)]"}`}
      onDragOver={(event) => {
        event.preventDefault();
        setDrag(true);
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDrag(false);
        const file = event.dataTransfer.files[0];
        if (file) void upload(file);
      }}
    >
      <div className="flex flex-wrap items-end gap-3">
        <label className="text-sm">
          <span className="mb-1 block text-xs text-muted">Evidence type</span>
          <select
            className="h-10 rounded-lg bg-sunken px-3 text-sm hairline"
            value={type}
            onChange={(event) => setType(event.target.value as EvidenceType)}
          >
            {EVIDENCE_TYPES.map((item) => (
              <option key={item} value={item}>
                {item.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </label>
        <Button
          variant="secondary"
          disabled={busy}
          onClick={() => document.getElementById("evidence-file")?.click()}
        >
          {busy ? "Uploading…" : "Choose file"}
        </Button>
        <p className="text-xs text-muted">Drop PDF, JPG, or PNG. No OCR is performed.</p>
      </div>
      <input
        id="evidence-file"
        type="file"
        accept="application/pdf,image/jpeg,image/png,.jpg"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) void upload(file);
        }}
      />
    </div>
  );
}
