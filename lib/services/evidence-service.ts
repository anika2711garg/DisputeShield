import "server-only";

import { createId } from "@/lib/db/ids";
import { getStore, saveStore } from "@/lib/db/local-store";
import { writeAudit } from "./audit-service";
import type { EvidenceItem, EvidenceType } from "@/types/domain";

const ALLOWED = new Set(["application/pdf", "image/jpeg", "image/jpg", "image/png"]);

export function validateUpload(mimeType: string, size: number): void {
  if (!ALLOWED.has(mimeType) && mimeType !== "image/jpg") {
    throw new Error("UNSUPPORTED_FILE");
  }
  if (size > 12 * 1024 * 1024) {
    throw new Error("FILE_TOO_LARGE");
  }
}

export function getEvidence(organizationId: string, evidenceId: string): EvidenceItem | undefined {
  return getStore().evidenceItems.find((item) => item.id === evidenceId && item.organizationId === organizationId);
}

export function addEvidence(input: {
  id?: string;
  organizationId: string;
  disputeId: string;
  orderId?: string;
  actorId: string;
  type: EvidenceType;
  title: string;
  source: string;
  contentText?: string;
  storagePath?: string;
  mimeType?: string;
}): EvidenceItem {
  const item: EvidenceItem = {
    id: input.id ?? createId("ev"),
    organizationId: input.organizationId,
    disputeId: input.disputeId,
    orderId: input.orderId,
    type: input.type,
    title: input.title,
    source: input.source,
    storagePath: input.storagePath,
    contentText: input.contentText,
    metadata: { mimeType: input.mimeType, localOnly: true },
    verified: false,
    relevanceScore: 50,
    strengthScore: 50,
    includedInContest: true,
    createdAt: new Date().toISOString(),
  };
  saveStore((store) => {
    store.evidenceItems.push(item);
  });
  writeAudit({
    organizationId: input.organizationId,
    disputeId: input.disputeId,
    actorType: "user",
    actorId: input.actorId,
    action: "evidence.uploaded",
    metadata: { evidenceId: item.id, title: item.title },
  });
  return item;
}

export function toggleEvidenceInclusion(organizationId: string, evidenceId: string, included: boolean, actorId: string): void {
  saveStore((store) => {
    const item = store.evidenceItems.find((row) => row.id === evidenceId && row.organizationId === organizationId);
    if (item) item.includedInContest = included;
  });
  writeAudit({
    organizationId,
    actorType: "user",
    actorId,
    action: included ? "evidence.included" : "evidence.excluded",
    metadata: { evidenceId },
  });
}
