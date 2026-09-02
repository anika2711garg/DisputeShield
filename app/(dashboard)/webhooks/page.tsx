import { requireSession } from "@/lib/auth/session";
import { listWebhookEvents } from "@/lib/services/webhook-service";
import { PageHeader } from "@/components/ui/page-header";
import { WebhookInbox } from "@/components/razorpay/webhook-inbox";

export default async function WebhooksPage() {
  await requireSession();
  const events = listWebhookEvents();
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Razorpay"
        title="Webhook inbox"
        description="Every payment.dispute.* event lands here first. HMAC is verified before a case is opened."
      />
      <WebhookInbox
        events={events.map((item) => ({
          id: item.id,
          eventType: item.eventType,
          signatureValid: item.signatureValid,
          processed: item.processed,
          processingError: item.processingError,
          receivedAt: item.receivedAt,
          payload: item.payload,
        }))}
      />
    </div>
  );
}
