# Architecture

```
Razorpay
  ↓
Next.js webhook route (raw body → HMAC verify)
  ↓
Webhook event persist (idempotent)
  ↓
Dispute upsert
  ↓
Evidence collection (merchant data)
  ↓
AI analysis (OpenAI Responses API or mock)
  ↓
Deterministic scoring + recommendation rules
  ↓
Human reviewer
  ↓
Razorpay contest / accept (blocked unless ENABLE_RAZORPAY_WRITES=true)
```

## Runtime

- Frontend and backend live in one Next.js 16 App Router app.
- Node.js runtime is required for webhook HMAC and Razorpay adapters.
- Demo mode uses a local JSON store (`.data/store.json`) so the product runs without Supabase, OpenAI, or Razorpay keys.
- When Supabase credentials are present, apply `supabase/migrations` and keep organisation resolution on the server session.

## Data

Merchant tables are organisation-scoped. RLS policies compare `organization_id` to the authenticated profile, never to a client-supplied id.

## Human gate

AI can draft. Rules can override. Only `admin` and `reviewer` may submit or accept. The UI label is not authorization.

## Core idea

**AI investigates. Humans decide.**
