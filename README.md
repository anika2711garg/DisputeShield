# DisputeShield

Chargeback investigation for Razorpay merchants.

The app pulls payment, shipment, invoice, and chat into one case file, scores the evidence in TypeScript, and lets a reviewer contest or accept. The model only reads unstructured text. It does not submit a contest or move money.

OpenAI and Razorpay keys are optional. Without them the app uses mock adapters and a local JSON store.

---

## What you need

| Tool | Version | Why |
| --- | --- | --- |
| [Node.js](https://nodejs.org/) | 20.9 or newer (20 LTS is fine) | Runs the Next.js app |
| npm | Comes with Node | This repo uses `package-lock.json`. Do not use pnpm or yarn. |
| Git | Any recent version | Clone the repo |
| A browser | Chrome, Edge, or Firefox | Use the desk |

Optional later:

- [Razorpay test keys](https://dashboard.razorpay.com/) if you want the real test adapter
- An OpenAI API key if you want live chat summaries instead of the mock AI

On Windows, install Node from the official installer or `winget install OpenJS.NodeJS.LTS`, then reopen the terminal so `node` and `npm` are on your PATH.

Check:

```bash
node -v
npm -v
```

---

## Install and run

```bash
git clone https://github.com/anika2711garg/DisputeShield.git
cd DisputeShield
npm install
copy .env.example .env.local
npm run seed
npm run dev
```

On macOS or Linux, use `cp .env.example .env.local` instead of `copy`.

The default env already runs in mock mode. You do not need Razorpay or OpenAI to use the app.

Next.js binds **http://localhost:3000**. If that port is taken it moves to 3001, 3002, 3003, and so on. Use the URL printed in the terminal.

`.env.local` in this checkout is already pointed at port 3003 because 3000–3002 are often busy on this machine. If Next prints a different port, either open that URL or change `NEXT_PUBLIC_APP_URL` and restart.

Stop the server with `Ctrl+C`.

---

## Sign in

Open `/login`. Password for every demo account is `demo1234`.

| Email | Role |
| --- | --- |
| `admin@disputeshield.dev` | Full desk, contest / accept, settings |
| `reviewer@disputeshield.dev` | Investigate and submit |
| `analyst@disputeshield.dev` | Read-only. Cannot contest or accept. |

Or go to `/signup`, create a workspace, and leave **Load the sample MacBook desk** checked.

---

## How to use the desk

After sign-in you land on the dashboard.

1. Open **Disputes**. Start with `disp_hero_macbook` (Rahul Sharma, MacBook Air, ₹60,000).
2. On the case page, walk payment → invoice → shipment → chat. The score and recommendation are calculated in code.
3. Use **What-if** to see how the score moves if you drop a piece of evidence.
4. **Contest** / **Accept** stay simulated unless you arm writes (see below). A toast is expected.
5. **Queue** is the work list. **Webhooks** is inbound Razorpay-shaped events. **Demo Center** replays sample events without a real Razorpay account.
6. **Rules lab** (`/lab`) is the contest threshold. **AI Evaluation** is the 150-case bench (50 held-out).
7. **Team** is invite and roles. **Activity** is the audit log.

Header badges:

- **Razorpay Demo Mode** — no live keys
- **Sim** — writes are not going to Razorpay
- **Armed** — you flipped the UI lock. Live mutation still needs `ENABLE_RAZORPAY_WRITES=true`

Leave writes off unless you intend a real Razorpay **test** contest.

---

## Environment

Copy `.env.example` to `.env.local`. Restart `npm run dev` after you edit it.

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
RAZORPAY_MODE=mock
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
ENABLE_RAZORPAY_WRITES=false
OPENAI_API_KEY=
DEMO_AUTH_SECRET=change-this-if-you-share-the-machine
```

| Variable | Default | Notes |
| --- | --- | --- |
| `RAZORPAY_MODE` | `mock` | `mock`, `test`, or `live`. Missing keys force mock. |
| `ENABLE_RAZORPAY_WRITES` | `false` | Must be `true` **and** the UI Armed to mutate Razorpay. |
| `OPENAI_API_KEY` | empty | Empty = mock summaries. |
| `DEMO_AUTH_SECRET` | example value | HMAC for the `ds_session` cookie. Change it on any shared host. |

Data lives in `.data/store.json` (gitignored). `npm run seed` rebuilds that file.

---

## Scripts

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies |
| `npm run seed` | Write the Northstar demo desk into `.data/store.json` |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm test` | Vitest unit tests |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run test:e2e` | Playwright (needs Chromium; see below) |
| `npm run ops:pending` | Process pending investigations / deadline bells |

Playwright (optional):

```bash
npx playwright install chromium
npm run test:e2e
```

Those e2e tests expect a server on **http://127.0.0.1:3003**, or set `PLAYWRIGHT_BASE_URL`.

---

## Razorpay test mode (optional)

1. Put test key id / secret in `.env.local`.
2. Set `RAZORPAY_MODE=test`. Keep `ENABLE_RAZORPAY_WRITES=false`.
3. Point the Razorpay webhook at `POST /api/webhooks/razorpay`.
4. Confirm the threshold in `/lab`.
5. Arm the header only when you mean to send a real test contest, then set `ENABLE_RAZORPAY_WRITES=true`.

Do not turn on live writes for a walkthrough.

---

## Deploy

```bash
npm ci
npm run build
npm start
```

On Vercel: import this repo, Framework Preset **Next.js**, Node **20**. `vercel.json` already runs `npm ci`.

Set at least:

- `DEMO_AUTH_SECRET` — not the example value
- `NEXT_PUBLIC_APP_URL` — public HTTPS URL
- `RAZORPAY_MODE=mock`
- `ENABLE_RAZORPAY_WRITES=false`

The JSON store writes `.data/store.json`. On a read-only host it falls back to `/tmp`, then memory. That is per instance, not a shared database.

---

## Stack

Next.js 16.3 · React 19 · TypeScript · Tailwind v4 · Motion · Recharts · Zod · OpenAI Responses API (optional) · Razorpay adapters · local JSON store · Vitest · Playwright

---

## Limits

- One JSON file, one process. Fine for a single desk, not a multi-server database.
- No OCR. Uploaded documents are not scanned.
- OpenAI is optional. Evaluation still scores facts in TypeScript.
- False-positive cost on the evaluation page is estimated merchant exposure, not a Razorpay fee.

More product detail: [`docs/PROJECT_DOCUMENTATION.md`](docs/PROJECT_DOCUMENTATION.md).
