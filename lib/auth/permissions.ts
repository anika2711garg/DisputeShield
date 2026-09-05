import type { UserRole } from "@/types/domain";

export function canSubmitFinancialAction(role: UserRole): boolean {
  return role === "admin" || role === "reviewer";
}

export function canManageTeam(role: UserRole): boolean {
  return role === "admin";
}

export function canRunEvaluation(role: UserRole): boolean {
  return role === "admin" || role === "analyst";
}

export function assertFinancialRole(role: UserRole): void {
  if (!canSubmitFinancialAction(role)) {
    throw new Error("PERMISSION_DENIED");
  }
}

export function assertManageTeam(role: UserRole): void {
  if (!canManageTeam(role)) {
    throw new Error("PERMISSION_DENIED");
  }
}
