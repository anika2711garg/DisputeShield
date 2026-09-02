import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { getCasePeek } from "@/lib/services/peek-service";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireSession();
  const { id } = await context.params;
  const peek = getCasePeek(user.organizationId, id);
  if (!peek) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(peek);
}
