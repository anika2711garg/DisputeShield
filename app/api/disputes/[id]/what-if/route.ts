import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { scoreWhatIf } from "@/lib/services/investigation-service";

const schema = z.object({ disabledEvidenceIds: z.array(z.string()) });

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireSession();
  const { id } = await context.params;
  const body = schema.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  return NextResponse.json(scoreWhatIf(user.organizationId, id, body.data.disabledEvidenceIds));
}
