import { AppShell } from "@/components/layout/app-shell";
import { requireSession } from "@/lib/auth/session";
import { aiRuntimeLabel } from "@/lib/ai";
import { razorpayRuntimeLabel } from "@/lib/razorpay/client";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await requireSession();
  return (
    <AppShell user={user} modeLabel={razorpayRuntimeLabel().label} aiLabel={aiRuntimeLabel().label}>
      {children}
    </AppShell>
  );
}
