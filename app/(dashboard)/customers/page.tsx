import Link from "next/link";
import { requireSession } from "@/lib/auth/session";
import { listCustomers } from "@/lib/services/dispute-service";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { PeekLink } from "@/components/ui/case-peek";

export default async function CustomersPage() {
  const user = await requireSession();
  const customers = listCustomers(user.organizationId);
  return (
    <div className="space-y-6">
      <PageHeader title="Customers" description="People attached to orders and chargebacks." />
      {customers.length === 0 ? (
        <EmptyState title="No customers" body="Seeded demo data appears after first load." />
      ) : (
        <div className="overflow-x-auto rounded-[14px] bg-surface hairline">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-[11px] uppercase tracking-[0.12em] text-muted">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th>Email</th>
                <th>Orders</th>
                <th>Disputes</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id} className="border-t">
                  <td className="px-4 py-3">
                    {customer.latestDisputeId ? (
                      <PeekLink id={customer.latestDisputeId} className="font-medium text-cyan">
                        {customer.name}
                      </PeekLink>
                    ) : (
                      <Link href={`/disputes?q=${encodeURIComponent(customer.name)}`} className="font-medium text-cyan">
                        {customer.name}
                      </Link>
                    )}
                  </td>
                  <td>{customer.email}</td>
                  <td>{customer.orderCount}</td>
                  <td>{customer.disputeCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
