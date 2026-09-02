import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { replayDemo } from "@/lib/services/demo-service";

const schema = z.object({
  scenario: z.enum(["strong", "weak", "conflict", "refunded", "service", "random", "hero"]),
});

export async function POST(request: Request) {
  await requireSession();
  const body = schema.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const result = await replayDemo(body.data.scenario);
  return NextResponse.json(result);
}
