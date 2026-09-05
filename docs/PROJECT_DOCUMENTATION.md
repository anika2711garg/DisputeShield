# DisputeShield

**Full name:** DisputeShield — AI Chargeback and Payment Dispute Investigation  
**Tagline:** AI investigates. Humans decide.  
**Domain:** Fintech · Payments · Chargebacks · Razorpay  
**Product type:** Web application for merchants and reviewers

---

## 1. Problem statement

Indian merchants who accept cards and UPI through Razorpay regularly receive **payment disputes** (chargebacks). A typical case looks like this:

A customer buys a product — for example a **MacBook Air for ₹60,000**. The merchant captures the payment, ships the order (BlueDart tracking **BD928312**), delivers it, and even receives a chat acknowledgement: *“Got the laptop, thanks!”* Ten days later the same customer files **“product not received”** with the payment processor.

The merchant now has a hard problem:

1. **Time is short.** Razorpay / the card network sets a respond-by deadline. Miss it and the merchant loses by default.
2. **Evidence is scattered.** Payment capture lives in Razorpay. The invoice lives in billing. Tracking lives with the courier. The acknowledgement lives in support chat. Nobody has one file.
3. **The claim language is messy.** Customers write informal, contradictory, or adversarial messages. A reviewer has to interpret that language without inventing facts.
4. **Money must not move automatically.** If an LLM or a rules engine could contest or accept on its own, a model error would send real funds. That is unacceptable.
5. **Teams are small.** Most merchants do not have a dedicated chargeback desk. Analysts, reviewers, and founders share the queue.

**The problem DisputeShield solves:**  
Reconstruct a Razorpay dispute into a single investigation file, score merchant evidence deterministically, use AI only to interpret conversations, and require a human to contest or accept — so investigation is fast and **no financial action happens without a person**.

---

## 2. One-line pitch

DisputeShield is an AI-assisted chargeback investigation desk for Razorpay merchants that assembles evidence, recommends the safest response, and keeps every contest or accept **human-approved**.

---

## 3. Thesis (non-negotiable)

**AI investigates. Humans decide.**

| Layer | Allowed | Forbidden |
| --- | --- | --- |
| AI model | Interpret chats, summarise the claim, flag contradictions, answer reviewer questions | Score money, run SQL, verify webhooks, submit contest/accept |
| Rules engine | Compute evidence score 0–100, recommend contest / accept / human_review | Talk to Razorpay, override a human |
| Human reviewer | Contest, accept, save draft, assign owner | Be skipped by automation |
| Razorpay writes | Only after UI Armed **and** `ENABLE_RAZORPAY_WRITES=true` | Silent live mutations in demo |

AI can draft. Rules can override the model when evidence is weak or contradictory. Only `admin` and `reviewer` may submit. The UI label is not authorization.

---

## 4. Objectives

1. Ingest Razorpay `payment.dispute.*` webhooks and open a case automatically.
2. Correlate payment, order, invoice, shipment, refunds, and customer messages into one bundle.
3. Score evidence in TypeScript (not in the LLM).
4. Use AI only for interpretation of unstructured text.
5. Show AI recommendation and rules recommendation **separately**. If they disagree, force human review.
6. Let a reviewer inspect evidence, run what-if scoring, preview the contest payload, then approve.
7. Simulate Razorpay writes by default so demos never move live money.
8. Keep an append-only audit log of system, AI, human, and Razorpay actions.
9. Evaluate the investigator on a held-out case set so claims about quality are measurable.

---

## 5. Target users

| Role | Who | What they can do |
| --- | --- | --- |
| **Admin** | Founder / ops lead | Full access, contest/accept, settings, team, evaluation |
| **Reviewer** | Chargeback analyst | Investigate, assign, contest/accept |
| **Analyst** | Junior / observer | Read cases, run evaluation, **cannot** submit or accept |

Demo accounts (password for all: `demo1234`):

- `admin@disputeshield.dev`
- `reviewer@disputeshield.dev`
- `analyst@disputeshield.dev`

---

## 6. Hero story (the case the product is built around)

**Case ID:** `disp_hero_macbook`  
**Customer:** Rahul Sharma · Bengaluru  
**Product:** MacBook Air · SKU `MBA-13-M3`  
**Amount at risk:** ₹60,000  
**Claim:** Product not received  
**Payment:** Razorpay `pay_demo_xyz`, captured, UPI  
**Order:** `ORD-8291` · Invoice `INV-8291`  
**Shipment:** BlueDart **BD928312**, delivered 14 Aug, recipient Rahul Sharma  
**Customer chat:** “Got the laptop, thanks!”  
**Evidence score:** typically **90+ / 100**  
**AI and rules:** both recommend **contest**  
**Final:** still **human review** until a reviewer clicks

This file is the proof that a strong merchant package exists, and that the product will still not contest until a person approves.

---

## 7. Solution overview

When a dispute arrives:

1. Razorpay (or the Demo Center) posts a webhook.
2. DisputeShield verifies HMAC, de-duplicates the event, and upserts a dispute.
3. The system matches payment → order → customer → shipment → invoice → messages → evidence.
4. Deterministic rules compute an evidence score and a rules recommendation.
5. AI (or a mock provider) writes a summary and an interpretation-only recommendation.
6. If AI ≠ rules, or evidence is weak, the final recommendation is `human_review`.
7. A reviewer opens the workspace, peeks facts, inspects the graph, optionally runs what-if, previews `POST /v1/disputes/{id}/contest` in **paise**, then Contests or Accepts.
8. Unless writes are armed **and** env-enabled, the action is labelled **simulation**.

---

## 8. Product modules

### 8.1 Landing

Explains the thesis, shows the investigation flow, and links to the live demo.

### 8.2 Dashboard (command centre)

- Amount at risk
- Contest-ready count
- Upcoming response deadlines
- Win rate
- AI ≠ rules disagreements
- Unassigned files
- Priority queue and recent investigations
- Hover **peek** on case rows (full dossier card)

### 8.3 Disputes table

Filterable, sortable list with views (needs attention, disagreements, unassigned). Columns include case, customer, reason, amount, evidence score, AI recommendation, rules recommendation, deadline, status, reviewer. Eye icon and case id open the peek card.

### 8.4 Case workspace

Single-file investigation:

- Fine-detail chips (payment id, Razorpay dispute id, order, tracking, invoice, phone, city, score, AI, rules)
- Readiness ring and deadline radar
- AI / Rules / Final recommendation cards
- Evidence graph (payment → order → invoice → shipment → delivery → chat)
- Evidence list with include/exclude for contest
- What-if: disable a piece of evidence and rescore **in the browser**, no new AI call
- Copilot: ask questions; answers cite internal evidence
- Payload preview of the Razorpay contest body
- Payment truth (captured, method, refunds)
- Presentation mode for a live pitch
- Human decision card: Contest / Accept / Draft

### 8.5 Review workspace

Save a contest draft, acknowledge the human gate, then Approve & Contest or Accept. Analysts cannot submit.

### 8.6 Assignment queue

Unassigned vs assigned files. Claim next deadline. Assign to a reviewer.

### 8.7 Razorpay webhook inbox

`POST /api/webhooks/razorpay`  
HMAC-SHA256 via `x-razorpay-signature`. Duplicate events keyed by event + dispute + created_at. Test-fire signed events from the UI.

### 8.8 Rules lab

Slider for contest threshold (default 80). Shows how many files would flip contest / accept / review. Saving the threshold does not auto-submit anything.

### 8.9 Orders, customers, evidence library

Merchant ledger views. Evidence can be uploaded onto a case. Paths stay organisation-scoped.

### 8.10 Analytics

Volume, reason mix, evidence-strength buckets, outcome funnel, human-escalation rate.

### 8.11 Activity

Append-only audit: system, AI, user, Razorpay. Distinct actor kinds.

### 8.12 AI Evaluation

150 synthetic cases (seed 8291): 100 development / 50 held-out. Reports accuracy, contest precision/recall, human escalations, estimated false-positive exposure. Held-out labels are not used to hand-tune individual answers.

### 8.13 Demo Center

Replay webhook-shaped scenarios: hero MacBook, weak shipping, unrecognized transaction, missing POD, conflicting chat.

### 8.14 Settings and mode bar

- **Theme:** light / dark (warm paper + ink teal + copper)
- **Simulation / Armed:** UI arm for writes. Live Razorpay still requires `ENABLE_RAZORPAY_WRITES=true`
- Contest threshold and auto-assign

### 8.15 Case peek

Hover a case id, customer name, or eye icon anywhere (dashboard, table, queue, activity, orders, customers, lab, evidence, webhooks, notifications, command palette). The card shows customer, amount, score ring, journey timeline, ledger ids, fulfillment, evidence dimensions, quote, merchant note, and latest activity.

### 8.16 Auth, team, and go-live

- Signup creates a workspace admin. Optional sample MacBook desk.
- Team invite, role change, remove, and one-time password. Invitees must change password on first login.
- Settings go-live checklist, operations job, dispute CSV and audit CSV.
- Open-case response deadlines are rebased if the seed dates have gone stale, so the desk never looks entirely overdue.

---

## 9. Evidence scoring (deterministic)

Computed in `lib/rules/evidence-score.ts`. The model does not own this number.

Typical dimensions (weights in code):

| Dimension | What it checks |
| --- | --- |
| Payment validity | Captured payment matches the disputed amount |
| Billing / invoice | Invoice or billing proof |
| Shipping / service | Courier or service proof |
| Delivery / completion | POD or access/activity log |
| Customer acknowledgement | Chat / email confirming receipt |
| History | Repeat customer / account signals |
| Policy | Terms or refund policy snapshot |
| Consistency | No material contradictions |

Penalties apply for contradictions, verified non-shipment, or a full refund already issued.  
Missing **critical** evidence types (by reason code) are listed on the file.  
What-if recalculates the same function locally.

**Contest threshold (default 80):** rules recommend contest only at or above the threshold, and only if critical evidence is present. Below that: accept or human_review, depending on facts.

---

## 10. What AI does and does not do

**AI does**

- Interpret the dispute reason from customer language
- Analyse support conversations
- Describe evidence relevance and contradictions in words
- Write a concise case summary
- Answer reviewer questions with internal citations (copilot)

**AI does not**

- Query SQL
- Add refunds or compute amounts
- Verify webhook signatures
- Check permissions
- Contest or accept
- Invent evidence IDs

Every investigation output is validated with **Zod**. Invalid JSON is retried once. A second failure marks the case `human_review` and keeps the deterministic score.

Customer messages are treated as **untrusted evidence**. They cannot change system instructions (prompt-injection guard).

If `OPENAI_API_KEY` is missing, `MockAIProvider` keeps the demo usable.

---

## 11. Razorpay integration

**Inbound**

- Events: `payment.dispute.created`, `action_required`, `under_review`, `won`, `lost`, `closed`
- Raw body HMAC verification
- Idempotent ingest
- Amounts stored as rupees in the app; contest preview sends **paise** (`amount * 100`)

**Outbound (guarded)**

- Preview: `POST /v1/disputes/{razorpayDisputeId}/contest`
- Accept: `POST /v1/disputes/{id}/accept`
- Default: mock adapter + simulation toast  
  `Simulation mode — no financial action was sent to Razorpay.`

Writes require **both**:

1. Mode toggle **Armed** in the UI (`settings.writeArmed`)
2. Environment `ENABLE_RAZORPAY_WRITES=true`

There is **no bulk contest**. Bulk investigate exists (max 8 files) and never submits.

---

## 12. System architecture

```
Razorpay (or Demo Center)
        ↓
Next.js webhook route (raw body → HMAC verify)
        ↓
Webhook event persist (idempotent)
        ↓
Dispute upsert + payment / order match
        ↓
Evidence collection (merchant data)
        ↓
AI analysis (OpenAI Responses API or mock)     ← interpretation only
        ↓
Deterministic scoring + recommendation rules   ← authority over the score
        ↓
Human reviewer (admin / reviewer)
        ↓
Razorpay contest / accept
  (blocked unless Armed + ENABLE_RAZORPAY_WRITES=true)
```

**Runtime:** Next.js 16 App Router (frontend + backend in one app). Node runtime for HMAC and adapters.

**Persistence (demo):** local JSON `.data/store.json`, auto-seeded.  
**Persistence (production-ready path):** Supabase Postgres + RLS, organisation resolved from the server session, never from a client-supplied id.

---

## 13. Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16.3 (App Router, Turbopack) |
| UI | React 19, TypeScript (strict), Tailwind CSS v4, Motion |
| Charts / graph | Recharts, React Flow |
| Validation | Zod |
| AI | OpenAI Responses API + mock provider |
| Payments | Razorpay adapters (mock / test / live) |
| Auth | Signed HMAC cookie `ds_session` (`userId.signature`). Passwords hashed with scrypt. Signup + team invite. |
| Tests | Vitest, Playwright |
| Package manager | npm (`package-lock.json`), Node 20+ |

---

## 14. How to run locally

```bash
cd DisputeShield
npm install
npm run seed
npm run dev
```

Open the URL Next prints. On a busy machine this is often `http://localhost:3003` (3000–3002 may belong to other apps).

Sign in: `admin@disputeshield.dev` / `demo1234`

Copy `.env.example` to `.env.local`. The app boots with Razorpay Demo Mode, AI Demo Mode, and the local JSON store.

```bash
npm run test
npm run typecheck
npm run lint
```

---

## 15. Security and safety

- Zod on mutating API routes
- Server-side role checks for contest / accept
- Webhook HMAC on the **raw** body
- Idempotent webhook keys
- Append-only audit logs
- Private evidence paths (`organization/dispute/evidence`)
- No `dangerouslySetInnerHTML` for customer messages
- Organisation from session only
- AI context omits secrets and trims conversation text
- Rate limit on `/api/disputes/[id]/ask-ai`
- Default `ENABLE_RAZORPAY_WRITES=false`

---

## 16. Known limitations

- Local JSON store is for demo / single-node use
- Sessions are signed and passwords are hashed; this is still a single-node desk, not Supabase Auth
- OCR is not performed; the UI never claims it
- Evaluation uses the rules/facts pipeline on a synthetic set, not live OpenAI on every held-out row unless configured
- False-positive cost is estimated merchant exposure, not a Razorpay fee
- Live Razorpay writes stay off until explicitly enabled

---

## 17. Hackathon / jury close

Merchants lose chargebacks because evidence is late and scattered — or because someone trusted a model with money.

DisputeShield makes investigation fast: one file, a deterministic score, an AI summary, a Razorpay-shaped contest payload.

It still will not contest the ₹60,000 MacBook until a human ticks the box.

**AI investigates. Humans decide.**
