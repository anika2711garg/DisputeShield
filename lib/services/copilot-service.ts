import "server-only";

import { getAIProvider } from "@/lib/ai";
import { buildCopilotContext } from "@/lib/ai/context-builder";
import { COPILOT_PROMPT_VERSION, SYSTEM_GUARDRAILS, copilotUserPrompt } from "@/lib/ai/prompts";
import { getOpenAiModel } from "@/lib/env";
import { getDisputeBundle } from "./dispute-service";

export async function askCaseCopilot(organizationId: string, disputeId: string, question: string) {
  const bundle = getDisputeBundle(organizationId, disputeId);
  if (!bundle) throw new Error("DISPUTE_NOT_FOUND");
  const context = buildCopilotContext({
    dispute: bundle.dispute,
    payment: bundle.payment,
    order: bundle.order,
    customer: bundle.customer,
    shipment: bundle.shipment,
    refunds: bundle.refunds,
    invoice: bundle.invoice,
    messages: bundle.messages,
    evidence: bundle.evidence,
  });
  const provider = getAIProvider();
  const result = await provider.answerCopilot({
    system: `${SYSTEM_GUARDRAILS}\nPrompt version ${COPILOT_PROMPT_VERSION}. Only use this dispute.`,
    user: copilotUserPrompt(question, context),
    model: getOpenAiModel(),
  });
  const allowed = new Set(bundle.evidence.map((item) => item.id));
  const citations = result.output.citations.filter((cite) => [...allowed].some((id) => cite.includes(id)) || bundle.evidence.some((item) => cite.includes(item.title)));
  return { ...result.output, citations, model: provider.name };
}
