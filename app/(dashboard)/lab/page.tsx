import { requireSession } from "@/lib/auth/session";
import { getWorkspaceSettings } from "@/lib/services/settings-service";
import { PageHeader } from "@/components/ui/page-header";
import { ThresholdLab } from "@/components/lab/threshold-lab";

export default async function LabPage() {
  await requireSession();
  const settings = getWorkspaceSettings();
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Rules lab"
        title="Contest threshold"
        description="See how many files would contest if you moved the evidence-score cutoff. Scores stay in code — AI is not recalled."
      />
      <ThresholdLab initial={settings.contestThreshold} />
    </div>
  );
}
