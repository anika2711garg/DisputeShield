import { requireSession } from "@/lib/auth/session";
import { latestEvaluationRun } from "@/lib/services/evaluation-service";
import { getStore } from "@/lib/db/local-store";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { MetricCard } from "@/components/ui/metric-card";
import { RunEvaluationButton } from "@/components/evaluation/run-button";
import { formatInr } from "@/lib/utils";

export default async function EvaluationPage() {
  await requireSession();
  const run = latestEvaluationRun();
  const cases = getStore().evaluationCases;
  const heldOut = cases.filter((item) => item.split === "held_out").length;
  const confusion = (run?.results.confusion ?? {}) as Record<string, Record<string, number>>;
  const labels = ["contest", "accept", "human_review"] as const;
  const agree = labels.reduce((sum, row) => sum + (confusion[row]?.[row] ?? 0), 0);
  const total = labels.reduce((sum, row) => sum + labels.reduce((inner, col) => inner + (confusion[row]?.[col] ?? 0), 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Evaluation"
        description="Evaluation measures AI recommendations. The production workflow still requires a human decision."
        actions={<RunEvaluationButton />}
      />
      <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
        <MetricCard label="Total cases" value={String(cases.length)} hint="150 seeded" />
        <MetricCard label="Held-out" value={String(heldOut)} hint="50 never used for hand-tuning" />
        <MetricCard label="Accuracy" value={run ? `${Math.round(run.accuracy * 100)}%` : "—"} />
        <MetricCard label="Contest precision" value={run ? `${Math.round(run.precision * 100)}%` : "—"} />
        <MetricCard label="Contest recall" value={run ? `${Math.round(run.recall * 100)}%` : "—"} />
      </div>
      {run && (
        <div className="grid gap-3 md:grid-cols-3">
          <MetricCard label="Agreement with rules" value={total ? `${Math.round((agree / total) * 100)}%` : "—"} />
          <MetricCard label="False contest rate" value={String(run.falsePositives)} hint="False contest recommendations" />
          <MetricCard label="Estimated FP exposure" value={formatInr(run.falsePositiveCost)} />
        </div>
      )}
      {!run ? (
        <Card>No evaluation run yet. Run the held-out set to populate the matrix.</Card>
      ) : (
        <Card>
          <h2 className="text-sm font-medium">Confusion matrix</h2>
          <p className="mt-1 text-xs text-muted">Truth on rows. Predicted labels on columns.</p>
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr>
                <th className="text-left">Truth \ Pred</th>
                <th>contest</th>
                <th>accept</th>
                <th>human_review</th>
              </tr>
            </thead>
            <tbody>
              {labels.map((row) => (
                <tr key={row} className="border-t">
                  <td className="py-2">{row}</td>
                  <td>{confusion[row]?.contest ?? 0}</td>
                  <td>{confusion[row]?.accept ?? 0}</td>
                  <td>{confusion[row]?.human_review ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
