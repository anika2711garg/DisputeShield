import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth/session";
import { aiRuntimeLabel } from "@/lib/ai";
import { razorpayRuntimeLabel } from "@/lib/razorpay/client";
import { getWorkspaceSettings, razorpayModeSnapshot, updateWorkspaceSettings } from "@/lib/services/settings-service";

const schema = z.object({
  writeArmed: z.boolean().optional(),
  contestThreshold: z.number().min(50).max(99).optional(),
  autoAssign: z.boolean().optional(),
});

export async function GET() {
  await requireSession();
  return NextResponse.json({
    settings: getWorkspaceSettings(),
    razorpay: { ...razorpayModeSnapshot(), label: razorpayRuntimeLabel().label },
    ai: aiRuntimeLabel(),
  });
}

export async function PATCH(request: Request) {
  const user = await requireSession();
  const body = schema.safeParse(await request.json());
  if (!body.success) return NextResponse.json({ error: "invalid" }, { status: 400 });
  const settings = updateWorkspaceSettings(body.data, user.id);
  return NextResponse.json({
    settings,
    razorpay: { ...razorpayModeSnapshot(), label: razorpayRuntimeLabel().label },
  });
}
