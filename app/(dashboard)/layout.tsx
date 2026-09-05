import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { getSessionUser } from "@/lib/auth/session";
import { aiRuntimeLabel } from "@/lib/ai";
import { razorpayRuntimeLabel } from "@/lib/razorpay/client";
import { razorpayWritesEnabled } from "@/lib/env";
import { getWorkspaceSettings } from "@/lib/services/settings-service";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  const settings = getWorkspaceSettings();
  return (
    <AppShell
      user={user}
      modeLabel={razorpayRuntimeLabel().label}
      aiLabel={aiRuntimeLabel().label}
      writeArmed={settings.writeArmed}
      writesEnvEnabled={razorpayWritesEnabled()}
    >
      {children}
    </AppShell>
  );
}
