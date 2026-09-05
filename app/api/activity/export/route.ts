import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth/session";
import { listAudit } from "@/lib/services/audit-service";

function csvCell(value: string): string {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`;
  return value;
}

export async function GET() {
  const user = await requireSession();
  const events = listAudit(user.organizationId);
  const header = ["created_at", "actor_type", "actor_id", "action", "dispute_id", "metadata"];
  const rows = events.map((item) => [
    item.createdAt,
    item.actorType,
    item.actorId,
    item.action,
    item.disputeId ?? "",
    JSON.stringify(item.metadata),
  ]);
  const csv = [header, ...rows].map((line) => line.map(csvCell).join(",")).join("\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=audit-log.csv",
      "Cache-Control": "private, no-store",
    },
  });
}
