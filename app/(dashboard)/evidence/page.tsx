import { requireSession } from "@/lib/auth/session";
import { getStore } from "@/lib/db/local-store";
import { EvidenceLibrary } from "@/components/evidence/library";

export default async function EvidencePage() {
  const user = await requireSession();
  const store = getStore();
  const items = store.evidenceItems.filter((item) => item.organizationId === user.organizationId);
  const disputes = store.disputes
    .filter((item) => item.organizationId === user.organizationId)
    .map((item) => ({ id: item.id, label: `${item.id} · ${item.reasonDescription}` }));
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Evidence library</h1>
        <p className="mt-2 text-muted">Private merchant evidence. Files stay off the public internet.</p>
      </div>
      <EvidenceLibrary items={items} disputes={disputes} />
    </div>
  );
}
