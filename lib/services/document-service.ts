import "server-only";

import { createId } from "@/lib/db/ids";
import { getStore, saveStore } from "@/lib/db/local-store";
import { getRazorpayAdapter } from "@/lib/razorpay/client";
import { isSimulatedWrite } from "@/lib/razorpay/types";
import { readEvidenceFile } from "@/lib/storage/local-files";
import type { CaseBundle } from "@/types/case";

export async function razorpayDocumentIdsForContest(
  bundle: CaseBundle,
  selectedEvidenceIds: string[],
  armed: boolean,
): Promise<string[]> {
  if (!armed) return selectedEvidenceIds;
  const adapter = getRazorpayAdapter();
  const chosen = bundle.evidence.filter((item) => selectedEvidenceIds.includes(item.id));
  const ids: string[] = [];

  for (const item of chosen) {
    const prior = getStore().razorpayDocuments.find((row) => row.evidenceItemId === item.id);
    if (prior) {
      ids.push(prior.razorpayDocumentId);
      continue;
    }

    const stored = item.storagePath ? readEvidenceFile(item.storagePath) : null;
    const bytes = stored ?? Buffer.from(item.contentText || item.title, "utf8");
    const mimeType = String(item.metadata.mimeType ?? (stored ? "application/octet-stream" : "text/plain"));
    const filename = item.storagePath?.split("/").at(-1) ?? `${item.id}.txt`;
    const uploaded = await adapter.uploadDocument({ filename, mimeType, bytes });
    if (isSimulatedWrite(uploaded)) continue;
    ids.push(uploaded.id);
    saveStore((store) => {
      store.razorpayDocuments.push({
        id: createId("rpdoc"),
        organizationId: bundle.dispute.organizationId,
        evidenceItemId: item.id,
        razorpayDocumentId: uploaded.id,
        purpose: "dispute_evidence",
        mimeType,
        createdAt: new Date().toISOString(),
      });
    });
  }

  return ids;
}
