import "server-only";

import { createId } from "@/lib/db/ids";
import { getStore, saveStore } from "@/lib/db/local-store";
import type { ActorType, AuditLog } from "@/types/domain";

export function writeAudit(input: {
  organizationId: string;
  disputeId?: string;
  actorType: ActorType;
  actorId: string;
  action: string;
  metadata?: Record<string, unknown>;
}): AuditLog {
  const event: AuditLog = {
    id: createId("aud"),
    organizationId: input.organizationId,
    disputeId: input.disputeId,
    actorType: input.actorType,
    actorId: input.actorId,
    action: input.action,
    metadata: input.metadata ?? {},
    createdAt: new Date().toISOString(),
  };
  saveStore((store) => {
    store.auditLogs.push(event);
  });
  return event;
}

export function listAudit(organizationId: string, disputeId?: string): AuditLog[] {
  return getStore()
    .auditLogs.filter((item) => item.organizationId === organizationId && (!disputeId || item.disputeId === disputeId))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
