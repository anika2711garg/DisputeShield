export function recommendationTone(value?: string) {
  if (value === "contest") return "emerald" as const;
  if (value === "accept") return "danger" as const;
  return "amber" as const;
}

export function statusTone(value: string) {
  if (value === "won") return "emerald" as const;
  if (value === "lost" || value === "accepted") return "danger" as const;
  if (value === "action_required") return "amber" as const;
  if (value === "under_review") return "ai" as const;
  return "muted" as const;
}
