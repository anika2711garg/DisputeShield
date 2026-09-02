import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { getDisputeBundle } from "@/lib/services/dispute-service";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireSession();
  const { id } = await context.params;
  const bundle = getDisputeBundle(user.organizationId, id);
  if (!bundle) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json(bundle);
}
