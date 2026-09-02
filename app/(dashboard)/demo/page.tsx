import { DemoCenter } from "@/components/demo/demo-center";

export default function DemoPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold">Demo Center</h1>
        <p className="mt-2 text-muted">Replays travel through the same webhook ingestion path as Razorpay.</p>
      </div>
      <DemoCenter />
    </div>
  );
}
