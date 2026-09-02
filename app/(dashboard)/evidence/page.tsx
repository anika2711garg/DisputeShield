import { requireSession } from "@/lib/auth/session";
import { getStore } from "@/lib/db/local-store";
import { EvidenceLibrary } from "@/components/evidence/library";
import { PageHeader } from "@/components/ui/page-header";

export default async function EvidencePage() {
  const user = await requireSession();
  const store = getStore();
  const items = store.evidenceItems.filter((item) => item.organizationId === user.organizationId);
  const disputes = store.disputes
    .filter((item) => item.organizationId === user.organizationId)
    .map((item) => ({ id: item.id, label: `${item.id} · ${item.reasonDescription}` }));
  return (
    <div className="space-y-6">
      <PageHeader title="Evidence" description="Private merchant evidence. Files stay off the public internet." />
      <EvidenceLibrary items={items} disputes={disputes} />
    </div>
  );
}
