import { requireSession } from "@/lib/auth/session";
import { listOrders } from "@/lib/services/dispute-service";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { formatInr } from "@/lib/utils";
import { formatShortDate } from "@/lib/ui/dates";
import { PeekLink } from "@/components/ui/case-peek";

export default async function OrdersPage() {
  const user = await requireSession();
  const orders = listOrders(user.organizationId);
  return (
    <div className="space-y-6">
      <PageHeader title="Orders" description="Merchant orders linked to payments and disputes." />
      {orders.length === 0 ? (
        <EmptyState title="No orders" body="Replay a demo event to populate the ledger." />
      ) : (
        <div className="overflow-x-auto rounded-[14px] bg-surface hairline">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="text-[11px] uppercase tracking-[0.12em] text-muted">
              <tr>
                <th className="px-4 py-3">Order</th>
                <th>Customer</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Created</th>
                <th>Dispute</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{order.externalId}</td>
                  <td>{order.customerName ?? "—"}</td>
                  <td>{formatInr(order.amount)}</td>
                  <td className="capitalize">{order.status}</td>
                  <td>{formatShortDate(order.createdAt)}</td>
                  <td>
                    {order.disputeId ? (
                      <PeekLink id={order.disputeId} className="text-cyan">
                        {order.disputeId}
                      </PeekLink>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
