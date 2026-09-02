import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { askCaseCopilot } from "@/lib/services/copilot-service";

const schema = z.object({ question: z.string().min(4).max(500) });
const windowHits = new Map<string, { count: number; reset: number }>();

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireSession();
  const { id } = await context.params;
  const now = Date.now();
  const bucket = windowHits.get(user.id) ?? { count: 0, reset: now + 60_000 };
  if (now > bucket.reset) {
    bucket.count = 0;
    bucket.reset = now + 60_000;
  }
  bucket.count += 1;
  windowHits.set(user.id, bucket);
  if (bucket.count > 20) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const body = schema.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const answer = await askCaseCopilot(user.organizationId, id, body.data.question);
  return NextResponse.json(answer);
}
