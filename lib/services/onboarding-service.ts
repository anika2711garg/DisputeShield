import "server-only";

import { getEnv, isOpenAiConfigured, isRazorpayConfigured, razorpayWritesEnabled } from "@/lib/env";
import { getStore } from "@/lib/db/local-store";
import { getWorkspaceSettings } from "./settings-service";

export type OnboardingStep = {
  id: string;
  title: string;
  body: string;
  href: string;
  done: boolean;
};

export function onboardingSteps(organizationId: string): OnboardingStep[] {
  const store = getStore();
  const settings = getWorkspaceSettings();
  const env = getEnv();
  const members = store.profiles.filter((item) => item.organizationId === organizationId);
  const disputes = store.disputes.filter((item) => item.organizationId === organizationId);
  return [
    {
      id: "team",
      title: "Invite a reviewer",
      body: "A second person can investigate while you keep admin control.",
      href: "/settings/team",
      done: members.length > 1,
    },
    {
      id: "cases",
      title: "Have at least one case",
      body: "Load the sample desk or wait for a Razorpay webhook.",
      href: "/disputes",
      done: disputes.length > 0,
    },
    {
      id: "threshold",
      title: "Confirm contest threshold",
      body: `Rules recommend contest at ${settings.contestThreshold}. Change it in the lab if you want.`,
      href: "/lab",
      done: settings.contestThreshold >= 50,
    },
    {
      id: "razorpay",
      title: "Add Razorpay test keys",
      body: "Set RAZORPAY_MODE=test plus key id, secret, and webhook secret in .env.local.",
      href: "/settings/integrations",
      done: isRazorpayConfigured(),
    },
    {
      id: "writes",
      title: "Keep live writes off until you mean it",
      body: "Contest stays simulated unless the UI is Armed and ENABLE_RAZORPAY_WRITES=true.",
      href: "/settings",
      done: !razorpayWritesEnabled() || !settings.writeArmed,
    },
    {
      id: "secret",
      title: "Set a session secret",
      body: "Change DEMO_AUTH_SECRET so signed cookies are not using the demo default.",
      href: "/settings",
      done: env.DEMO_AUTH_SECRET !== "disputeshield-demo-secret",
    },
    {
      id: "ai",
      title: "Optional: OpenAI for investigation copy",
      body: "Without a key, interpretation stays on the deterministic demo investigator.",
      href: "/settings/integrations",
      done: isOpenAiConfigured(),
    },
  ];
}

export function onboardingProgress(organizationId: string) {
  const steps = onboardingSteps(organizationId);
  const required = steps.filter((item) => item.id !== "ai");
  return {
    steps,
    done: required.filter((item) => item.done).length,
    total: required.length,
    complete: required.every((item) => item.done),
  };
}
