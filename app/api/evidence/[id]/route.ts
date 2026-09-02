import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { getEvidence, toggleEvidenceInclusion } from "@/lib/services/evidence-service";

const schema = z.object({ includedInContest: z.boolean() });

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireSession();
  const { id } = await context.params;
  const item = getEvidence(user.organizationId, id);
  if (!item) return NextResponse.json({ error: "not_found" }, { status: 404 });
  const body = schema.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  toggleEvidenceInclusion(user.organizationId, id, body.data.includedInContest, user.id);
  return NextResponse.json({ ok: true });
}
