import { razorpayRuntimeLabel } from "@/lib/razorpay/client";
import { aiRuntimeLabel } from "@/lib/ai";
import { isSupabaseConfigured } from "@/lib/env";
import { razorpayModeSnapshot } from "@/lib/services/settings-service";
import { Card } from "@/components/ui/card";
import { PageHeader } from "@/components/ui/page-header";
import { RazorpayActions } from "@/components/settings/razorpay-actions";

export default function IntegrationsPage() {
  const razorpay = razorpayModeSnapshot();
  return (
    <div className="space-y-6">
      <PageHeader title="Integrations" description="Razorpay is the system of record for payments, disputes, and webhooks." />
      <Card>
        <h2 className="font-medium">Razorpay</h2>
        <p className="mt-2 text-sm text-muted">
          {razorpayRuntimeLabel().label}. Adapter {razorpay.adapterMode}. Writes require Armed mode and ENABLE_RAZORPAY_WRITES=true.
        </p>
        <ul className="mt-3 space-y-1 text-sm text-muted">
          <li>Key: {razorpay.configured ? razorpay.keyIdMasked : "mock — add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to .env.local"}</li>
          <li>Mode: set RAZORPAY_MODE=test for Razorpay test keys. Keep ENABLE_RAZORPAY_WRITES=false until you arm the UI.</li>
          <li>Webhook HMAC: {razorpay.webhookSecretSet ? "required" : "set RAZORPAY_WEBHOOK_SECRET for signed live/test events"}</li>
          <li>Endpoint: POST /api/webhooks/razorpay</li>
          <li>Contest uploads selected evidence as Razorpay documents, then submits their IDs.</li>
        </ul>
        <RazorpayActions />
      </Card>
      <Card>
        <h2 className="font-medium">OpenAI</h2>
        <p className="mt-2 text-sm text-muted">{aiRuntimeLabel().label}. Model is read from OPENAI_MODEL. It interprets chats — it never scores or submits.</p>
      </Card>
      <Card>
        <h2 className="font-medium">Supabase</h2>
        <p className="mt-2 text-sm text-muted">
          {isSupabaseConfigured() ? "Connected" : "Local demo store is active. Apply supabase/migrations when ready."}
        </p>
      </Card>
    </div>
  );
}
