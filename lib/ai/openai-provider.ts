import "server-only";

import OpenAI from "openai";
import { getEnv } from "@/lib/env";
import { aiInvestigationOutputSchema, copilotAnswerSchema } from "./schemas";
import type { AIProvider, CopilotRequest, InvestigationRequest } from "./provider";

function extractText(response: unknown): string {
  if (typeof response !== "object" || response === null) return "";
  const record = response as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> };
  if (record.output_text) return record.output_text;
  const chunks = record.output?.flatMap((item) => item.content ?? []) ?? [];
  return chunks.map((chunk) => chunk.text ?? "").join("").trim();
}

export class OpenAIProvider implements AIProvider {
  name = "openai" as const;
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({ apiKey: getEnv().OPENAI_API_KEY });
  }

  private async complete(request: { system: string; user: string; model: string }): Promise<string> {
    const response = await this.client.responses.create({
      model: request.model,
      input: [
        { role: "system", content: request.system },
        { role: "user", content: request.user },
      ],
    });
    return extractText(response);
  }

  async investigate(request: InvestigationRequest) {
    const started = Date.now();
    let text = await this.complete(request);
    let parsed = aiInvestigationOutputSchema.safeParse(safeJson(text));
    if (!parsed.success) {
      text = await this.complete({
        ...request,
        user: `${request.user}\n\nYour previous output was invalid JSON. Return valid JSON only.`,
      });
      parsed = aiInvestigationOutputSchema.safeParse(safeJson(text));
    }
    if (!parsed.success) {
      throw new Error("AI_INVALID_JSON");
    }
    return { output: parsed.data, raw: text, latencyMs: Date.now() - started };
  }

  async answerCopilot(request: CopilotRequest) {
    const started = Date.now();
    const text = await this.complete(request);
    const parsed = copilotAnswerSchema.safeParse(safeJson(text));
    if (!parsed.success) {
      return {
        output: { answer: "I could not structure that answer. Please retry.", citations: [] },
        latencyMs: Date.now() - started,
      };
    }
    return { output: parsed.data, latencyMs: Date.now() - started };
  }
}

function safeJson(text: string): unknown {
  const trimmed = text.trim().replace(/^```json\s*/i, "").replace(/```$/, "");
  try {
    return JSON.parse(trimmed);
  } catch {
    return null;
  }
}
