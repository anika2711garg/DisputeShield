import { DemoCenter } from "@/components/demo/demo-center";
import { PageHeader } from "@/components/ui/page-header";

export default function DemoPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Hackathon stage"
        title="Demo Center"
        description="Fire webhook-shaped events through the same ingestion path as Razorpay. Simulation only — no live writes."
      />
      <DemoCenter />
    </div>
  );
}
