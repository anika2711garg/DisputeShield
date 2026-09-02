# Razorpay setup

Do not put real credentials in git.

## Environment

```
RAZORPAY_MODE=mock|test|live
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
ENABLE_RAZORPAY_WRITES=false
```

Default mode is `mock`. Missing keys also force the mock adapter.

## Webhook

`POST /api/webhooks/razorpay`

Subscribe at least:

- payment.dispute.created
- payment.dispute.action_required
- payment.dispute.under_review
- payment.dispute.won
- payment.dispute.lost
- payment.dispute.closed

The route reads the **raw body**, verifies `X-Razorpay-Signature` with HMAC SHA-256, then parses JSON.

If `RAZORPAY_MODE=mock` and no webhook secret is set, demo replays are accepted as simulated events.

## Documents

Local uploads go to a private merchant path first. They become Razorpay documents only when a human-approved contest package is submitted with purpose `dispute_evidence`.

## Draft vs submit

- Save Draft writes a local contest package.
- Approve & Contest is the Razorpay write (or a labelled simulation).

## Safety

Keep `ENABLE_RAZORPAY_WRITES=false` for demos. The UI will say:

`Simulation mode — no financial action was sent to Razorpay.`
