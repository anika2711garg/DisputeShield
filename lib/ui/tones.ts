export { recommendationTone, displayStatus } from "./labels";

export function statusTone(value: string) {
  if (value === "won" || value === "Contest Ready") return "emerald" as const;
  if (value === "lost" || value === "accepted" || value === "Accepted") return "danger" as const;
  if (value === "action_required" || value === "Needs Review" || value === "Investigating") return "amber" as const;
  if (value === "under_review" || value === "Contested") return "ai" as const;
  return "muted" as const;
}
