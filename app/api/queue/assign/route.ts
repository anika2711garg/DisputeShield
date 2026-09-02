import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { assignDispute, claimNext } from "@/lib/services/queue-service";

const schema = z.object({
  disputeId: z.string().optional(),
  assigneeId: z.string().nullable().optional(),
  claim: z.boolean().optional(),
});

export async function POST(request: Request) {
  const user = await requireSession();
  const body = schema.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  if (body.data.claim) {
    const id = claimNext(user.organizationId, user.id);
    return NextResponse.json({ claimed: id });
  }
  if (!body.data.disputeId) return NextResponse.json({ error: "invalid" }, { status: 400 });
  assignDispute(user.organizationId, body.data.disputeId, body.data.assigneeId ?? null, user.id);
  return NextResponse.json({ ok: true });
}
