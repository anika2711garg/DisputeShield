import Link from "next/link";
import { Check, Circle } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { OnboardingStep } from "@/lib/services/onboarding-service";

export function OnboardingChecklist({
  steps,
  done,
  total,
}: {
  steps: OnboardingStep[];
  done: number;
  total: number;
}) {
  return (
    <Card>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-medium">Go-live checklist</h2>
          <p className="mt-1 text-sm text-muted">
            {done}/{total} required steps. OpenAI is optional. Live Razorpay writes stay off until you arm them.
          </p>
        </div>
      </div>
      <ol className="mt-4 space-y-2">
        {steps.map((step) => (
          <li key={step.id}>
            <Link href={step.href as never} className="flex items-start gap-3 rounded-[10px] px-2 py-2 hover:bg-sunken/70">
              {step.done ? <Check className="mt-0.5 size-4 text-emerald" /> : <Circle className="mt-0.5 size-4 text-muted" />}
              <span>
                <span className="block text-sm font-medium">{step.title}</span>
                <span className="block text-xs text-muted">{step.body}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </Card>
  );
}
