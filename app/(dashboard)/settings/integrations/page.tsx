import { razorpayRuntimeLabel } from "@/lib/razorpay/client";
import { aiRuntimeLabel } from "@/lib/ai";
import { isSupabaseConfigured } from "@/lib/env";
import { Card } from "@/components/ui/card";

export default function IntegrationsPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-semibold">Integrations</h1>
      <Card>
        <h2 className="font-medium">Razorpay</h2>
        <p className="mt-2 text-sm text-muted">{razorpayRuntimeLabel().label}. Writes are blocked unless ENABLE_RAZORPAY_WRITES=true.</p>
      </Card>
      <Card>
        <h2 className="font-medium">OpenAI</h2>
        <p className="mt-2 text-sm text-muted">{aiRuntimeLabel().label}. Model is read from OPENAI_MODEL.</p>
      </Card>
      <Card>
        <h2 className="font-medium">Supabase</h2>
        <p className="mt-2 text-sm text-muted">{isSupabaseConfigured() ? "Connected" : "Local demo store is active. Apply supabase/migrations when ready."}</p>
      </Card>
    </div>
  );
}
