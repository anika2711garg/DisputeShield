import "server-only";

import { getStore } from "@/lib/db/local-store";
import { deadlineUrgency } from "@/lib/ui/dates";
import { investigateDispute } from "./investigation-service";
import { notify } from "./notification-service";

export function emitDeadlineAlerts(organizationId?: string, now = Date.now()): number {
  const store = getStore();
  const open = store.disputes.filter(
    (item) =>
      (!organizationId || item.organizationId === organizationId) &&
      !["won", "lost", "closed", "accepted"].includes(item.status),
  );
  let created = 0;
  for (const dispute of open) {
    const urgency = deadlineUrgency(dispute.respondBy, now);
    if (urgency !== "urgent" && urgency !== "soon" && urgency !== "overdue") continue;
    if (urgency === "overdue" && dispute.respondBy) {
      const missed = now - new Date(dispute.respondBy).getTime();
      if (missed > 48 * 3_600_000) continue;
    }
    const already = store.notifications.some(
      (item) => item.href === `/disputes/${dispute.id}` && item.title.toLowerCase().includes("deadline"),
    );
    if (already) continue;
    notify({
      organizationId: dispute.organizationId,
      title: urgency === "overdue" ? "Response deadline missed" : "Response deadline soon",
      body: `${dispute.id} is ${urgency}. Open the file before Razorpay closes it.`,
      href: `/disputes/${dispute.id}`,
    });
    created += 1;
  }
  return created;
}

export async function processPendingJobs() {
  const store = getStore();
  const pending = store.disputes.filter((item) => !store.aiInvestigations.some((inv) => inv.disputeId === item.id)).slice(0, 5);
  const processed = [];
  for (const dispute of pending) {
    processed.push(await investigateDispute(dispute.organizationId, dispute.id, "cron"));
  }
  const deadlineAlerts = emitDeadlineAlerts();
  return { processed: processed.length, deadlineAlerts };
}
