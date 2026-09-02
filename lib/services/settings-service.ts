import "server-only";

import { DEFAULT_WORKSPACE_SETTINGS, type WorkspaceSettings } from "@/types/domain";
import { getStore, saveStore } from "@/lib/db/local-store";
import { getEnv, isRazorpayConfigured, razorpayWritesEnabled } from "@/lib/env";
import { writeAudit } from "./audit-service";

export function getWorkspaceSettings(): WorkspaceSettings {
  const store = getStore();
  return { ...DEFAULT_WORKSPACE_SETTINGS, ...store.settings };
}

export function updateWorkspaceSettings(patch: Partial<WorkspaceSettings>, actorId = "system"): WorkspaceSettings {
  let next = getWorkspaceSettings();
  saveStore((store) => {
    store.settings = { ...getWorkspaceSettings(), ...patch };
    next = store.settings;
  });
  writeAudit({
    organizationId: getStore().organizations[0]?.id ?? "org",
    actorType: "user",
    actorId,
    action: "settings.updated",
    metadata: patch,
  });
  return next;
}

export function razorpayModeSnapshot() {
  const env = getEnv();
  const settings = getWorkspaceSettings();
  const writesEnv = razorpayWritesEnabled();
  const configured = isRazorpayConfigured();
  return {
    adapterMode: env.RAZORPAY_MODE,
    configured,
    writesEnvEnabled: writesEnv,
    writeArmed: settings.writeArmed,
    contestThreshold: settings.contestThreshold,
    autoAssign: settings.autoAssign,
    liveWrites: writesEnv && settings.writeArmed,
    keyIdMasked: env.RAZORPAY_KEY_ID ? `${env.RAZORPAY_KEY_ID.slice(0, 8)}…` : "",
    webhookSecretSet: Boolean(env.RAZORPAY_WEBHOOK_SECRET),
  };
}
