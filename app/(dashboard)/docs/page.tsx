import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";

export default function DocsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Documentation" description="How DisputeShield keeps AI investigative and humans in control." />
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="display text-2xl italic">AI interpretation</h2>
          <p className="mt-2 text-sm text-muted">The model summarises chats, spots contradictions and answers reviewer questions. It does not score the file.</p>
        </Card>
        <Card>
          <h2 className="display text-2xl italic">Rules-calculated</h2>
          <p className="mt-2 text-sm text-muted">Payment, billing, shipping, delivery, acknowledgement and consistency are scored in TypeScript. What-if recalculates locally.</p>
        </Card>
        <Card>
          <h2 className="display text-2xl italic">Human approval required</h2>
          <p className="mt-2 text-sm text-muted">Contest and Accept stay disabled until a reviewer acknowledges the action. Analysts can prepare, not submit.</p>
        </Card>
        <Card>
          <h2 className="display text-2xl italic">Simulation mode</h2>
          <p className="mt-2 text-sm text-muted">The header toggle arms writes. Razorpay is still not mutated unless ENABLE_RAZORPAY_WRITES=true. Demo toasts never imply a live mutation.</p>
        </Card>
        <Card>
          <h2 className="display text-2xl italic">Razorpay webhooks</h2>
          <p className="mt-2 text-sm text-muted">POST /api/webhooks/razorpay with x-razorpay-signature. Events are idempotent on event + dispute + created_at.</p>
        </Card>
        <Card>
          <h2 className="display text-2xl italic">Contest payload</h2>
          <p className="mt-2 text-sm text-muted">Each case previews POST /v1/disputes/{"{id}"}/contest in paise, with submitted_documents, before a human can submit.</p>
        </Card>
        <Card>
          <h2 className="display text-2xl italic">Signed session and team</h2>
          <p className="mt-2 text-sm text-muted">Cookies are HMAC-signed. Passwords are hashed. Admins invite reviewers and analysts at Settings → Team. Invited people must change the one-time password.</p>
        </Card>
        <Card>
          <h2 className="display text-2xl italic">Go-live without moving money</h2>
          <p className="mt-2 text-sm text-muted">Settings has the checklist. Keep ENABLE_RAZORPAY_WRITES=false until you arm the UI for a real Razorpay test contest. Deadline bells run from the bell poll or npm run ops:pending.</p>
        </Card>
      </div>
    </div>
  );
}
