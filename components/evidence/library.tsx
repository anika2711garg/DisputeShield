"use client";

import { useState } from "react";
import type { EvidenceItem } from "@/types/domain";
import { Card } from "@/components/ui/card";
import { EvidenceUpload } from "@/components/disputes/evidence-upload";
import { EvidencePreviewDrawer } from "@/components/disputes/evidence-preview-drawer";
import { PeekLink } from "@/components/ui/case-peek";

export function EvidenceLibrary({
  items,
  disputes,
}: {
  items: EvidenceItem[];
  disputes: { id: string; label: string }[];
}) {
  const [preview, setPreview] = useState<EvidenceItem | null>(null);
  const [disputeId, setDisputeId] = useState(disputes[0]?.id ?? "");

  return (
    <div className="space-y-6">
      {disputeId && (
        <div className="space-y-3">
          <label className="text-sm">
            <span className="mb-1 block text-xs text-muted">Upload onto case</span>
            <select className="h-10 rounded-lg bg-sunken px-3 text-sm hairline" value={disputeId} onChange={(event) => setDisputeId(event.target.value)}>
              {disputes.map((dispute) => (
                <option key={dispute.id} value={dispute.id}>
                  {dispute.label}
                </option>
              ))}
            </select>
          </label>
          <EvidenceUpload disputeId={disputeId} />
        </div>
      )}
      {items.length === 0 ? (
        <Card>No evidence yet. Replay a demo dispute to populate the library.</Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-2">
          {items.map((item) => (
            <button key={item.id} type="button" className="text-left" onClick={() => setPreview(item)}>
              <Card>
                <div className="text-xs text-muted">{item.id} · {item.type}</div>
                <div className="mt-1 font-medium">{item.title}</div>
                <p className="mt-2 text-sm text-muted">{item.contentText}</p>
                <span onClick={(event) => event.stopPropagation()}>
                  <PeekLink id={item.disputeId} className="mt-3 inline-block text-sm text-cyan">
                    Open case
                  </PeekLink>
                </span>
              </Card>
            </button>
          ))}
        </div>
      )}
      <EvidencePreviewDrawer item={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
