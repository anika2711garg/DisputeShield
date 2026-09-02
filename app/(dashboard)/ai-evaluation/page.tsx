import { requireSession } from "@/lib/auth/session";
import { latestEvaluationRun } from "@/lib/services/evaluation-service";
import { getStore } from "@/lib/db/local-store";
import { Card } from "@/components/ui/card";
import { RunEvaluationButton } from "@/components/evaluation/run-button";
import { formatInr } from "@/lib/utils";

export default async function EvaluationPage() {
  await requireSession();
  const run = latestEvaluationRun();
  const heldOut = getStore().evaluationCases.filter((item) => item.split === "held_out").length;
  const confusion = (run?.results.confusion ?? {}) as Record<string, Record<string, number>>;

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-semibold">AI evaluation</h1>
          <p className="mt-2 text-muted">Held-out labels were not used to tune individual answers.</p>
        </div>
        <RunEvaluationButton />
      </div>
      {!run ? (
        <Card>No evaluation run yet.</Card>
      ) : (
        <>
          <div className="grid gap-3 md:grid-cols-4">
            <Stat label="Test cases" value={String(heldOut)} />
            <Stat label="Accuracy" value={`${Math.round(run.accuracy * 100)}%`} />
            <Stat label="Contest precision" value={`${Math.round(run.precision * 100)}%`} />
            <Stat label="Contest recall" value={`${Math.round(run.recall * 100)}%`} />
            <Stat label="False positives" value={String(run.falsePositives)} />
            <Stat label="False negatives" value={String(run.falseNegatives)} />
            <Stat label="Human escalations" value={String(run.humanEscalations)} />
            <Stat label="Estimated FP exposure" value={formatInr(run.falsePositiveCost)} />
          </div>
          <Card>
            <h2 className="text-sm text-muted">Confusion matrix</h2>
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr>
                  <th className="text-left">Truth \\ Pred</th>
                  <th>contest</th>
                  <th>accept</th>
                  <th>human_review</th>
                </tr>
              </thead>
              <tbody>
                {["contest", "accept", "human_review"].map((row) => (
                  <tr key={row} className="border-t">
                    <td className="py-2">{row}</td>
                    <td>{confusion[row]?.contest ?? 0}</td>
                    <td>{confusion[row]?.accept ?? 0}</td>
                    <td>{confusion[row]?.human_review ?? 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-4 text-xs text-muted">
              Estimated merchant false-positive exposure is a model of operational + amount risk. It is not a Razorpay fee.
            </p>
          </Card>
        </>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <div className="text-xs uppercase text-muted">{label}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </Card>
  );
}
