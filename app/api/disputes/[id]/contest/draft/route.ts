import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { saveContestDraft } from "@/lib/services/action-service";

const schema = z.object({
  selectedEvidenceIds: z.array(z.string()),
  summary: z.string().min(1),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireSession();
  const { id } = await context.params;
  const body = schema.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  saveContestDraft(user, id, body.data.selectedEvidenceIds, body.data.summary);
  return NextResponse.json({ ok: true });
}
