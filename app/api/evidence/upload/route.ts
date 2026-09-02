import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { addEvidence, validateUpload } from "@/lib/services/evidence-service";
import { createId } from "@/lib/db/ids";
import { safeFileName, writeEvidenceFile } from "@/lib/storage/local-files";
import { EVIDENCE_TYPES, type EvidenceType } from "@/types/domain";

export async function POST(request: Request) {
  const user = await requireSession();
  const form = await request.formData();
  const file = form.get("file");
  const disputeId = String(form.get("disputeId") ?? "");
  const type = String(form.get("type") ?? "other") as EvidenceType;
  if (!(file instanceof File) || !disputeId) return NextResponse.json({ error: "invalid" }, { status: 400 });
  if (!EVIDENCE_TYPES.includes(type)) return NextResponse.json({ error: "invalid_type" }, { status: 400 });
  validateUpload(file.type, file.size);
  const id = createId("ev");
  const storagePath = `${user.organizationId}/${disputeId}/${id}/${safeFileName(file.name)}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  writeEvidenceFile(storagePath, bytes);
  const item = addEvidence({
    id,
    organizationId: user.organizationId,
    disputeId,
    actorId: user.id,
    type,
    title: file.name,
    source: "Upload",
    contentText: `Uploaded file ${file.name} stored privately. No OCR was performed.`,
    storagePath,
    mimeType: file.type,
  });
  return NextResponse.json({
    item,
    note: "Stored in private merchant evidence path. This is not a Razorpay document until contest submission uploads it.",
  });
}
