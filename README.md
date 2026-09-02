# DisputeShield

AI chargeback and payment dispute investigation for Razorpay merchants.

**AI investigates. Humans decide.**

## Problem

A merchant delivers a ₹60,000 laptop. Ten days later the customer files “product not received.” Someone has to reconstruct payment, shipment, invoice and chat evidence before the response deadline — without letting an LLM send money out the door.

## Solution

DisputeShield ingests a Razorpay dispute, correlates merchant data, scores evidence in code, asks AI only for interpretation, and requires a human to contest or accept.

## Features

- Premium risk command centre
- Dispute list with filters and views
- Case workspace with readiness ring, deadline radar, what-if, evidence graph, replay, copilot
- Human-gated contest / accept (simulation by default)
- Append-only audit log
- Demo Center that replays webhook-shaped events
- 150-case evaluation set (50 held-out)
- Mock adapters when OpenAI or Razorpay keys are missing

## Screenshots

Add pitch screenshots here after `npm run dev`:

- Landing hero
- Dashboard
- Hero MacBook case
- Review workspace
- AI evaluation

## Tech stack

Next.js 16.3 · React · TypeScript · Tailwind · Motion · Recharts · Zod · OpenAI Responses API · Razorpay adapters · Supabase-ready Postgres schema · Vitest · Playwright

The intended package manager is pnpm (`packageManager` field). This repo also installs cleanly with npm.

## AI usage

AI interprets messy conversations and writes a summary. It does **not** query SQL, compute refunds, verify webhooks, or submit contests.

## Run locally

```bash
npm install
npm run seed
npm run dev
```

Open http://localhost:3000

Demo login:

- `admin@disputeshield.dev` / `demo1234`
- `reviewer@disputeshield.dev` / `demo1234`
- `analyst@disputeshield.dev` / `demo1234` (cannot submit or accept)

## Environment

Copy `.env.example` to `.env.local`. The app boots with:

- Razorpay Demo Mode
- AI Demo Mode
- local JSON store

See `.env.example` for Supabase, OpenAI, and Razorpay keys.

## Tests

```bash
npm run test
npm run typecheck
npm run lint
```

## Production notes

- Apply `supabase/migrations/001_init.sql`
- Create a private `dispute-evidence` bucket
- Set `RAZORPAY_MODE=test` and a webhook secret
- Keep `ENABLE_RAZORPAY_WRITES=false` until go-live
- Never commit secrets

## Known limitations

- Local JSON store is for demo/single-node use
- OCR is not performed; the UI never claims it
- False-positive cost is an estimated merchant exposure, not a Razorpay fee

## Hackathon pitch

DisputeShield makes investigation fast without giving an LLM authority over merchant money.
