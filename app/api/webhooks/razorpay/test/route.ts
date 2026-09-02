import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { fireTestWebhook } from "@/lib/services/webhook-service";

const schema = z.object({
  event: z.string().optional(),
  amount: z.number().optional(),
  reason: z.string().optional(),
});

export async function POST(request: Request) {
  await requireSession();
  const body = schema.safeParse(await request.json().catch(() => ({})));
  const result = fireTestWebhook(body.success ? body.data : {});
  return NextResponse.json(result);
}
