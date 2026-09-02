# Security

- Zod validation on every mutating route
- Server-side role checks for contest/accept
- Webhook HMAC on the raw body
- Idempotent webhook keys
- Append-only audit logs
- Private evidence paths (`organization/dispute/evidence`)
- No `dangerouslySetInnerHTML` for customer messages
- Service-role Supabase only on the server
- Organisation resolved from session, never from the client
- AI context omits secrets and trims conversation text
- Rate limit on `/api/disputes/[id]/ask-ai`
- Default write guard: `ENABLE_RAZORPAY_WRITES=false`
