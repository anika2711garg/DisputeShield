import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { getEvidence } from "@/lib/services/evidence-service";
import { readEvidenceFile } from "@/lib/storage/local-files";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireSession();
  const { id } = await context.params;
  const item = getEvidence(user.organizationId, id);
  if (!item?.storagePath) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const bytes = readEvidenceFile(item.storagePath);
  if (!bytes) return NextResponse.json({ error: "missing_file" }, { status: 404 });
  const mime = String(item.metadata.mimeType ?? "application/octet-stream");
  return new NextResponse(new Uint8Array(bytes), {
    headers: {
      "Content-Type": mime,
      "Content-Disposition": `inline; filename="${item.title.replaceAll('"', "")}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
