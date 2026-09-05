import { getStore, saveStore } from "@/lib/db/local-store";
import { writeAudit } from "@/lib/services/audit-service";
import { buildClonedCatalog, DEMO_CATALOG_TABLES } from "./clone-catalog";

export function cloneDemoIntoOrganization(organizationId: string, adminUserId: string) {
  if (getStore().disputes.some((item) => item.organizationId === organizationId)) {
    throw new Error("ALREADY_SEEDED");
  }
  const { catalog, disputeCount } = buildClonedCatalog(organizationId, adminUserId);
  saveStore((store) => {
    for (const table of DEMO_CATALOG_TABLES) {
      (store[table] as unknown[]).push(...(catalog[table] as unknown[]));
    }
  });
  writeAudit({
    organizationId,
    actorType: "user",
    actorId: adminUserId,
    action: "workspace.demo_loaded",
    metadata: { disputes: disputeCount },
  });
  return { disputes: disputeCount };
}
