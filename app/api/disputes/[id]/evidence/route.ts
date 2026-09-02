import { NextResponse } from "next/server";
import { z } from "zod";
import { EVIDENCE_TYPES } from "@/types/domain";
import { requireSession } from "@/lib/auth/session";
import { addEvidence } from "@/lib/services/evidence-service";

const schema = z.object({
  type: z.enum(EVIDENCE_TYPES),
  title: z.string().min(2),
  source: z.string().min(2),
  contentText: z.string().optional(),
});

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireSession();
  const { id } = await context.params;
  const body = schema.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const item = addEvidence({
    organizationId: user.organizationId,
    disputeId: id,
    actorId: user.id,
    ...body.data,
  });
  return NextResponse.json(item);
}
