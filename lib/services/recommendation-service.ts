import "server-only";

import { getDisputeBundle } from "./dispute-service";
import { scoreWhatIf } from "./investigation-service";

export function getRecommendation(organizationId: string, disputeId: string) {
  return getDisputeBundle(organizationId, disputeId)?.recommendation ?? null;
}

export function previewRecommendation(organizationId: string, disputeId: string, disabledEvidenceIds: string[]) {
  return scoreWhatIf(organizationId, disputeId, disabledEvidenceIds);
}
