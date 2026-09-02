import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { searchGlobal } from "@/lib/services/dispute-service";

export async function GET(request: Request) {
  const user = await requireSession();
  const q = new URL(request.url).searchParams.get("q") ?? "";
  if (q.length < 2) return NextResponse.json({ disputes: [], orders: [], customers: [], evidence: [] });
  return NextResponse.json(searchGlobal(user.organizationId, q));
}
