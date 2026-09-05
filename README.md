# DisputeShield

AI chargeback and payment dispute investigation for Razorpay merchants.

**AI investigates. Humans decide.**

## Problem

A merchant delivers a ₹60,000 laptop. Ten days later the customer files “product not received.” Someone has to reconstruct payment, shipment, invoice and chat evidence before the response deadline — without letting an LLM send money out the door.

## Solution

DisputeShield ingests a Razorpay dispute, correlates merchant data, scores evidence in code, asks AI only for interpretation, and requires a human to contest or accept.

## Features

- Signed sessions, hashed passwords, signup, team invite / roles
- Risk command centre, queue, webhooks, orders, customers, evidence, analytics
- Case workspace with readiness ring, deadline radar, what-if, evidence graph, replay, copilot
- Human-gated contest / accept (simulation by default)
- Contest uploads selected evidence as Razorpay documents when Armed
- Deadline bells (in-app + `npm run ops:pending`)
- Append-only audit log with CSV export
- Demo Center that replays webhook-shaped events
- 150-case evaluation set (50 held-out)
- Mock adapters when OpenAI or Razorpay keys are missing

## Run locally

```bash
npm install
npm run seed
npm run dev
```

If port 3000 is already taken, Next.js moves to 3001, 3002, 3003, … Use the URL printed in the terminal.

Demo login (password `demo1234` for all):

- `admin@disputeshield.dev`
- `reviewer@disputeshield.dev`
- `analyst@disputeshield.dev` (cannot submit or accept)

Or open `/signup` and create a workspace. Leave **Load the sample MacBook desk** checked to walk the product immediately.

## Environment

Copy `.env.example` to `.env.local`. Do not paste secrets into chat.

The app boots with Razorpay mock mode, AI demo mode, and a local JSON store (`.data/store.json`).

```
RAZORPAY_MODE=test
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
ENABLE_RAZORPAY_WRITES=false
DEMO_AUTH_SECRET=change-this
```

Restart `npm run dev` after editing `.env.local`.

## Go-live checklist (Razorpay test)

1. Change `DEMO_AUTH_SECRET`.
2. Add Razorpay **test** keys. Keep `ENABLE_RAZORPAY_WRITES=false`.
3. Point Razorpay webhooks at `POST /api/webhooks/razorpay`.
4. Invite a reviewer at `/settings/team`. They must change the one-time password.
5. Confirm the contest threshold in `/lab`.
6. Arm the UI **only** when you intend a real test contest, then set `ENABLE_RAZORPAY_WRITES=true`.
7. Run pending investigations / deadline bells: `npm run ops:pending` or **Settings → Run now**.

Never enable live writes for a demo.

## Tests

```bash
npm run test
npm run typecheck
npm run test:e2e
```

Playwright reuses the running Next server (this repo only allows one `next dev`). Default base URL is http://127.0.0.1:3003. Override with `PLAYWRIGHT_BASE_URL` if yours is different.

## Tech stack

Next.js 16.3 · React · TypeScript · Tailwind · Motion · Recharts · Zod · OpenAI Responses API · Razorpay adapters · JSON store (Supabase schema ready, unused) · Vitest · Playwright

Use npm. The `packageManager` field still mentions pnpm.

## AI usage

AI interprets messy conversations and writes a summary. It does **not** query SQL, compute refunds, verify webhooks, or submit contests.

## Known limitations

- Local JSON store is single-node. Fine for one merchant desk; not a multi-server database.
- OCR is not performed; the UI never claims it.
- OpenAI is optional. Evaluation still scores facts in TypeScript unless you add a key.
- False-positive cost is estimated merchant exposure, not a Razorpay fee.

## Hackathon pitch

DisputeShield makes investigation fast without giving an LLM authority over merchant money.
