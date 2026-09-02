import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth/session";
import { getDisputeBundle } from "@/lib/services/dispute-service";
import { ReviewWorkspace } from "@/components/disputes/review-workspace";

export default async function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireSession();
  const { id } = await params;
  const bundle = getDisputeBundle(user.organizationId, id);
  if (!bundle) notFound();
  return <ReviewWorkspace bundle={JSON.parse(JSON.stringify(bundle))} role={user.role} />;
}
