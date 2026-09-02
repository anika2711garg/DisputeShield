import type { Recommendation } from "@/types/domain";

export function recommendationLabel(value?: string | null): string {
  if (value === "contest") return "Contest";
  if (value === "accept") return "Accept";
  if (value === "human_review") return "Human review";
  return "Pending";
}

export function displayStatus(input: {
  status: string;
  phase?: string;
  recommendation?: string;
}): string {
  if (input.phase === "investigating") return "Investigating";
  if (input.status === "accepted") return "Accepted";
  if (input.status === "won") return "Won";
  if (input.status === "lost") return "Lost";
  if (input.status === "under_review" || input.phase === "submitted") return "Contested";
  if (input.recommendation === "contest" && ["open", "action_required", "ready"].includes(input.status)) {
    return "Contest Ready";
  }
  if (input.status === "action_required" || input.recommendation === "human_review") return "Needs Review";
  if (input.status === "open") return "Needs Review";
  return input.status.replaceAll("_", " ");
}

export function statusToneFromLabel(label: string) {
  if (label === "Contest Ready" || label === "Won") return "emerald" as const;
  if (label === "Accepted" || label === "Lost") return "danger" as const;
  if (label === "Needs Review" || label === "Investigating") return "amber" as const;
  if (label === "Contested") return "ai" as const;
  return "muted" as const;
}

export function recommendationTone(value?: string) {
  if (value === "contest") return "emerald" as const;
  if (value === "accept") return "danger" as const;
  return "amber" as const;
}

export function actorKind(actorType: string): "ai" | "human" | "system" {
  if (actorType === "AI") return "ai";
  if (actorType === "user") return "human";
  return "system";
}

export function recShort(value?: Recommendation | string | null): string {
  return recommendationLabel(value);
}
