import { requireSession } from "@/lib/auth/session";
import { listAudit } from "@/lib/services/audit-service";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { formatAbsolute } from "@/lib/ui/dates";
import { actorKind } from "@/lib/ui/labels";
import { PeekLink } from "@/components/ui/case-peek";

export default async function ActivityPage() {
  const user = await requireSession();
  const events = listAudit(user.organizationId).slice().reverse();
  return (
    <div className="space-y-6">
      <PageHeader title="Activity" description="Append-only audit log. AI, system and human actions stay distinct." />
      {events.length === 0 ? (
        <EmptyState title="No action required." body="You're clear for now." />
      ) : (
        <div className="overflow-x-auto rounded-[14px] bg-surface hairline">
          <table className="w-full min-w-[860px] text-left text-sm">
            <thead className="text-[11px] uppercase tracking-[0.12em] text-muted">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th>Actor</th>
                <th>Role</th>
                <th>Event</th>
                <th>Case</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => {
                const kind = actorKind(event.actorType);
                return (
                  <tr key={event.id} className="border-t">
                    <td className="px-4 py-3 text-muted">{formatAbsolute(event.createdAt)}</td>
                    <td>{event.actorId}</td>
                    <td>
                      <span className={`inline-flex items-center gap-1.5 capitalize ${kind === "ai" ? "text-cyan" : kind === "human" ? "text-amber" : "text-muted"}`}>
                        <span className={`size-1.5 rounded-full ${kind === "ai" ? "bg-cyan" : kind === "human" ? "bg-amber" : "bg-slate-400"}`} />
                        {event.actorType}
                      </span>
                    </td>
                    <td className="font-medium">{event.action}</td>
                    <td>
                      {event.disputeId ? (
                        <PeekLink id={event.disputeId} className="text-cyan">
                          {event.disputeId}
                        </PeekLink>
                      ) : (
                        "org"
                      )}
                    </td>
                    <td className="max-w-xs truncate text-muted">{JSON.stringify(event.metadata)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
