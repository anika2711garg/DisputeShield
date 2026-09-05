import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { assertManageTeam } from "@/lib/auth/permissions";
import { cloneDemoIntoOrganization } from "@/lib/demo/clone-into-org";

export async function POST() {
  const user = await requireSession();
  assertManageTeam(user.role);
  try {
    const result = cloneDemoIntoOrganization(user.organizationId, user.id);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "failed";
    return NextResponse.json({ error: message.toLowerCase() }, { status: message === "ALREADY_SEEDED" ? 409 : 400 });
  }
}
