import { describe, expect, it } from "vitest";
import { ORG_ID, USERS } from "@/lib/demo/constants";
import { buildClonedCatalog } from "@/lib/demo/clone-catalog";

describe("clone demo catalog", () => {
  it("remaps organisation and keeps hero evidence attached", () => {
    const orgId = "org_newdesk";
    const adminId = "usr_new_admin";
    const { catalog, disputeCount } = buildClonedCatalog(orgId, adminId);
    expect(disputeCount).toBeGreaterThan(0);
    expect(catalog.disputes.every((item) => item.organizationId === orgId)).toBe(true);
    expect(catalog.disputes.some((item) => item.id === "disp_hero_macbook")).toBe(false);
    const dispute = catalog.disputes[0];
    expect(dispute?.assigneeId === undefined || dispute.assigneeId === adminId).toBe(true);
    const evidence = catalog.evidenceItems.filter((item) => item.disputeId === dispute?.id);
    expect(evidence.length).toBeGreaterThan(0);
    expect(catalog.customers.some((item) => item.id === ORG_ID)).toBe(false);
    expect(catalog.customers.some((item) => item.id === USERS.admin.id)).toBe(false);
  });
});
