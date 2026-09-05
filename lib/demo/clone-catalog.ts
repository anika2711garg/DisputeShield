import { createId } from "@/lib/db/ids";
import type { AppStore } from "@/types/domain";
import { ORG_ID, USERS } from "./constants";
import { buildDemoStore } from "./seed-data";

export const DEMO_CATALOG_TABLES = [
  "customers",
  "products",
  "orders",
  "orderItems",
  "payments",
  "refunds",
  "shipments",
  "invoices",
  "customerMessages",
  "disputes",
  "evidenceItems",
  "aiInvestigations",
  "recommendations",
  "approvals",
  "razorpayDocuments",
  "notifications",
  "contestDrafts",
] as const;

const FK_KEYS = [
  "id",
  "customerId",
  "productId",
  "orderId",
  "paymentId",
  "disputeId",
  "evidenceItemId",
  "aiInvestigationId",
  "assigneeId",
  "userId",
] as const;

function prefixOf(id: string): string {
  return id.split("_")[0] || "id";
}

export function buildClonedCatalog(organizationId: string, adminUserId: string) {
  const demo = buildDemoStore();
  const map = new Map<string, string>();
  map.set(ORG_ID, organizationId);
  map.set(USERS.admin.id, adminUserId);
  map.set(USERS.reviewer.id, adminUserId);
  map.set(USERS.analyst.id, adminUserId);

  function mapped(id: string): string {
    const existing = map.get(id);
    if (existing) return existing;
    const next = createId(prefixOf(id));
    map.set(id, next);
    return next;
  }

  for (const table of DEMO_CATALOG_TABLES) {
    for (const row of demo[table] as { id: string }[]) mapped(row.id);
  }

  const suffix = organizationId.replace(/\W/g, "").slice(-8);
  const catalog = {} as Pick<AppStore, (typeof DEMO_CATALOG_TABLES)[number]>;

  for (const table of DEMO_CATALOG_TABLES) {
    catalog[table] = (demo[table] as Record<string, unknown>[]).map((row) => {
      const copy = structuredClone(row);
      if ("organizationId" in copy) copy.organizationId = organizationId;
      for (const key of FK_KEYS) {
        if (typeof copy[key] === "string") copy[key] = mapped(copy[key]);
      }
      if (Array.isArray(copy.selectedEvidenceIds)) {
        copy.selectedEvidenceIds = copy.selectedEvidenceIds.map((id: string) => mapped(id));
      }
      for (const key of ["razorpayDisputeId", "razorpayPaymentId", "razorpayOrderId", "razorpayRefundId", "razorpayDocumentId"] as const) {
        if (typeof copy[key] === "string") copy[key] = `${copy[key]}_${suffix}`;
      }
      if (typeof copy.externalId === "string") copy.externalId = `${copy.externalId}-${suffix}`;
      if (typeof copy.invoiceNumber === "string") copy.invoiceNumber = `${copy.invoiceNumber}-${suffix}`;
      if (typeof copy.trackingId === "string") copy.trackingId = `${copy.trackingId}-${suffix}`;
      return copy;
    }) as never;
  }

  return { catalog, disputeCount: demo.disputes.length };
}
