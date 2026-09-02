"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { EvidenceItem } from "@/types/domain";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function EvidencePreviewDrawer({
  item,
  onClose,
  onToggle,
}: {
  item: EvidenceItem | null;
  onClose: () => void;
  onToggle?: (id: string, included: boolean) => void;
}) {
  const router = useRouter();
  if (!item) return null;
  const current = item;

  const mime = String(current.metadata.mimeType ?? "");
  const isImage = mime.startsWith("image/");
  const isPdf = mime === "application/pdf";
  const fileUrl = current.storagePath ? `/api/evidence/${current.id}/file` : null;

  async function toggle(included: boolean) {
    const response = await fetch(`/api/evidence/${current.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ includedInContest: included }),
    });
    if (!response.ok) {
      toast.error("Could not update contest inclusion");
      return;
    }
    onToggle?.(current.id, included);
    router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50" onClick={onClose}>
      <aside
        className="h-full w-full max-w-xl overflow-y-auto bg-surface p-6 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-label={`Evidence ${item.title}`}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xs text-muted">{item.id}</div>
            <h2 className="mt-1 text-xl font-semibold">{item.title}</h2>
          </div>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge>{item.type.replaceAll("_", " ")}</Badge>
          <Badge tone={item.verified ? "emerald" : "amber"}>{item.verified ? "Verified" : "Unverified"}</Badge>
          <Badge tone={item.includedInContest ? "cyan" : "muted"}>{item.includedInContest ? "In contest" : "Excluded"}</Badge>
        </div>
        <dl className="mt-4 grid gap-2 text-sm">
          <Row label="Source" value={item.source} />
          <Row label="Uploaded" value={item.createdAt.replace("T", " ").slice(0, 16)} />
          <Row label="Path" value={item.storagePath ?? "Structured merchant record"} />
          <Row label="Relevance / strength" value={`${item.relevanceScore} / ${item.strengthScore}`} />
        </dl>
        <div className="mt-5 overflow-hidden rounded-2xl bg-sunken hairline">
          {fileUrl && isImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={fileUrl} alt={item.title} className="max-h-[420px] w-full object-contain" />
          ) : fileUrl && isPdf ? (
            <iframe title={item.title} src={fileUrl} className="h-[420px] w-full border-0" />
          ) : (
            <p className="p-4 text-sm text-muted">
              {item.contentText ?? "No file preview. Seeded records are structured facts, not uploaded binaries."}
            </p>
          )}
        </div>
        {item.contentText && fileUrl && <p className="mt-3 text-sm">{item.contentText}</p>}
        <p className="mt-3 text-xs text-muted">No OCR was performed on this file.</p>
        <div className="mt-6 flex gap-2">
          <Button variant="secondary" onClick={() => toggle(!item.includedInContest)}>
            {item.includedInContest ? "Exclude from contest" : "Include in contest"}
          </Button>
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-muted">{label}</dt>
      <dd className="text-right">{value}</dd>
    </div>
  );
}
