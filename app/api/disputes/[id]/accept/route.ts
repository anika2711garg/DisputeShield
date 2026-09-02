import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { acceptDispute } from "@/lib/services/action-service";

const schema = z.object({ confirm: z.literal("ACCEPT") });

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireSession();
  const { id } = await context.params;
  const body = schema.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  try {
    const result = await acceptDispute(user, id, body.data.confirm);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed";
    return NextResponse.json({ error: message }, { status: message === "PERMISSION_DENIED" ? 403 : 400 });
  }
}
