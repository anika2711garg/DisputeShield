import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { investigateDispute } from "@/lib/services/investigation-service";

export async function POST(_request: Request, context: { params: Promise<{ id: string }> }) {
  const user = await requireSession();
  const { id } = await context.params;
  const result = await investigateDispute(user.organizationId, id, user.id);
  return NextResponse.json(result);
}
