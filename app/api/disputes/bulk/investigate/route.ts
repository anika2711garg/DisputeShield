import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { investigateDispute } from "@/lib/services/investigation-service";

const schema = z.object({ ids: z.array(z.string()).min(1).max(8) });

export async function POST(request: Request) {
  const user = await requireSession();
  const body = schema.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const results = [];
  for (const id of body.data.ids) {
    try {
      await investigateDispute(user.organizationId, id, user.id);
      results.push({ id, ok: true });
    } catch (error) {
      results.push({ id, ok: false, error: error instanceof Error ? error.message : "failed" });
    }
  }
  return NextResponse.json({ results });
}
