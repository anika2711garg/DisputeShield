import { requireSession } from "@/lib/auth/session";
import { listAudit } from "@/lib/services/audit-service";

export default async function ActivityPage() {
  const user = await requireSession();
  const events = listAudit(user.organizationId).slice().reverse();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Activity</h1>
      {events.length === 0 ? (
        <p className="text-muted">No action required. You&apos;re clear for now.</p>
      ) : (
        <ol className="space-y-3">
          {events.map((event) => (
            <li key={event.id} className="rounded-xl bg-surface p-4 hairline">
              <div className="text-xs text-muted">
                {event.createdAt.replace("T", " ").slice(0, 19)} · {event.actorType} · {event.disputeId ?? "org"}
              </div>
              <div className="mt-1 font-medium">{event.action}</div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
