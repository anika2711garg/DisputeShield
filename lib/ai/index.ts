import "server-only";

import { isOpenAiConfigured } from "@/lib/env";
import { MockAIProvider } from "./mock-provider";
import { OpenAIProvider } from "./openai-provider";
import type { AIProvider } from "./provider";

let cached: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (cached) return cached;
  cached = isOpenAiConfigured() ? new OpenAIProvider() : new MockAIProvider();
  return cached;
}

export function aiRuntimeLabel(): { mode: "openai" | "mock"; label: string } {
  const provider = getAIProvider();
  return provider.name === "openai"
    ? { mode: "openai", label: "AI Live" }
    : { mode: "mock", label: "AI Demo Mode" };
}
