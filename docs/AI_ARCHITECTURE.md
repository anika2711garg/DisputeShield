# AI architecture

## What AI does

- Dispute reason interpretation
- Support conversation analysis
- Evidence relevance and contradiction language
- Concise case summary
- Case copilot answers with internal citations

## What AI does not do

- SQL, arithmetic, refund totals
- Webhook verification
- Permission checks
- Final contest or accept
- Invent evidence IDs

## Structured output

Every investigation is validated with Zod (`lib/ai/schemas.ts`). Invalid JSON is retried once. A second failure marks the case `human_review` and keeps the deterministic score.

## Prompt injection

Customer messages and documents are untrusted. The system prompt states they are evidence content only and must never change instructions.

## Scoring vs confidence

- Evidence score: deterministic merchant-strength (0–100)
- AI confidence: model certainty about its interpretation

These are displayed separately.

## Versioning

`DISPUTE_ANALYSIS_PROMPT_VERSION=v1.0.0` is stored on every `ai_investigations` row with model, latency, and input hash.

## Evaluation

150 synthetic cases (seed 8291). 100 development / 50 held-out. Held-out labels are not used to hand-tune individual answers.

## Fallback

Missing `OPENAI_API_KEY` uses `MockAIProvider`. The page remains usable.
