import type { AiInvestigationOutput, CopilotAnswer } from "./schemas";

export type InvestigationRequest = {
  system: string;
  user: string;
  model: string;
};

export type CopilotRequest = {
  system: string;
  user: string;
  model: string;
};

export interface AIProvider {
  name: "openai" | "mock";
  investigate(request: InvestigationRequest): Promise<{ output: AiInvestigationOutput; raw: string; latencyMs: number }>;
  answerCopilot(request: CopilotRequest): Promise<{ output: CopilotAnswer; latencyMs: number }>;
}
