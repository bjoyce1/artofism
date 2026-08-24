# Platform Audit Remediation Plan

This is a large multi-area change. I'll implement it in ordered phases on the current branch, keeping the visual identity, book content, $9.99 USD lifetime price, and existing public URLs untouched. No production deploy — build/lint/tests only at the end.

## Assumptions
- Keep PayPal as the sole payment provider (no switch to Paddle/Stripe).
- "Service-role-only" for `send-transactional-email` = check `SUPABASE_SERVICE_ROLE_KEY` in the incoming `Authorization` header, not signed JWTs. The existing `auth-email-hook` flow is unaffected (it enqueues via RPC, not this function).
- Analytics table becomes writable only by an Edge Function using service role; browser inserts are removed. A lightweight in-memory rate limit per IP is acceptable given single-instance Edge runtime.
- "Automatic merge" of guest → user progress: on first sign-in only, copy any guest local keys into user-namespaced keys where the user has no existing value, then clear guest keys. No cross-user leakage.
- PayPal webhook: implement signature verification via PayPal's `/v1/notifications/verify-webhook-signature` REST endpoint using `PAYPAL_WEBHOOK_ID`. If the secret is missing, the function returns 503 and logs — documented in README.
- Structured data page count: replace `numberOfPages: 11` with `numberOfChapters: 11` (Book schema does support `numberOfPages` but we don't know true page count; chapter count is accurate).
- Mobile nav "four primary destinations": Home, Library (or Get Access if not entitled), Vault, Codes; More sheet holds the rest.

## Phase 1 — Commerce & security (Edge Functions + DB)

1. **DB migration**:
   - `public.finalize_paypal_purchase(_user_id uuid, _order_id text, _amount numeric, _currency text, _payer_email text, _capture_id text, _raw jsonb)` — SECURITY DEFINER, revoked from public/anon/authenticated, granted to `service_role` only. Inserts into `purchases` (idempotent on `provider_order_id`), upserts `entitlements(user_id,'art-of-ism-full-access')` active, all in one txn. Returns entitlement row.
   - `public.revoke_entitlement_by_order(_order_id text, _reason text)` — same lock-down. Marks entitlement inactive on refund/reversal/dispute.
   - Tighten `analytics_events` RLS: drop public INSERT, allow only service_role INSERT; SELECT stays as-is.

2. **`send-transactional-email`**: check `Authorization: Bearer <SERVICE_ROLE_KEY>` (constant-time compare). Return 403 otherwise. Add Deno test.

3. **New `create-paypal-order`** (verify_jwt=false, validates JWT in code): authenticated user only. Server calls PayPal Orders v2 API with hard-coded `{amount: '9.99', currency: 'USD', description: 'The Art of ISM — Full Access', custom_id: userId}`. Returns `{orderId}`. Uses OAuth client credentials from `PAYPAL_CLIENT_ID`/`PAYPAL_SECRET`; env base URL (sandbox/live) via `PAYPAL_ENV`.

4. **`verify-paypal` rewrite**: authenticated user. GET order → assert `status in (APPROVED,COMPLETED)`, `purchase_units[0].amount.value === '9.99'`, `currency_code === 'USD'`, `custom_id === userId`. Capture. Re-validate capture (`status=COMPLETED`, same amount). Call `finalize_paypal_purchase` RPC. Confirm entitlement row via follow-up select. Return success only then. On any persistence failure: return 500 with clear error, never log-and-continue. Idempotency preserved via unique index on `purchases.provider_order_id`.

5. **New `paypal-webhook`** (verify_jwt=false, public): verify signature via PayPal's verify-webhook-signature endpoint using `PAYPAL_WEBHOOK_ID` + headers. Handle `PAYMENT.CAPTURE.COMPLETED` (reconcile via finalize RPC), `PAYMENT.CAPTURE.REFUNDED`/`REVERSED`/`DENIED` and `CUSTOMER.DISPUTE.CREATED` (revoke RPC). 503 if `PAYPAL_WEBHOOK_ID` missing.

6. **Unlock.tsx**: replace `actions.order.create` with `createOrder: () => fetch create-paypal-order`. Never define amount client-side.

## Phase 2 — Funnel & reliability

7. **Auth next-path**: helper `safeNext(next)` accepting only same-origin relative paths matching `^/[a-zA-Z0-9/_\-?=&]*$`, not starting with `//`. Used by Unlock link (`/auth?next=/unlock`), magic link `emailRedirectTo`, and post-auth navigate. `/auth` default remains `/library`.

8. **Access state**: `useAuth` exposes `accessStatus: 'loading'|'granted'|'denied'|'error'`. `ProtectedRoute` renders retryable error UI on `error` with Retry + mailto support link, not LockScreen.

9. **Analytics**: new `log-analytics` Edge Function (public, no JWT — accepts optional user JWT to attach user_id). Per-IP token bucket. Client `trackEvent` posts to it. Drop client-side inserts. Purchase confirmation events emitted server-side inside `verify-paypal` and `paypal-webhook`. Never include order IDs or emails from client.

10. **User-namespaced storage**: helper `userStorage(key)` → `ism:${userId||'guest'}:${key}`. Migrate `useReadingProgress`, favorites, scroll positions, reading mode, font size. On sign-in, if user namespace empty for a key and guest has value, copy over then clear guest.

## Phase 3 — A11y, SEO, mobile

11. **Reduced motion**: `useReducedMotion` hook driving Framer Motion, smoke/ember effects, parallax, smooth scroll behavior. CSS `@media (prefers-reduced-motion: reduce)` block already in `index.css` — extend it.

12. **Audio controls**: replace clickable progress divs in `ChapterNarrationBar` and `SectionAudioButton` with shadcn `Slider` bound to currentTime, with `aria-label="Seek"`, `aria-valuetext` as time. All icon buttons get `aria-label`.

13. **Vault cards**: convert card divs to `<button>`, open shadcn `Dialog` (has focus trap/Esc/restore). Keyboard operable.

14. **SEO**:
    - Homepage: real `<h1>The Art of ISM</h1>` visually replaced by logo via `sr-only` pattern (keep logo image visible, h1 sr-only).
    - Per-route unique metadata already via `SEO` component — audit and fill gaps for Vault, Chapter 1, Mint.
    - Chapter 1 JSON-LD `Chapter` schema + canonical.
    - `index.html` JSON-LD: change `numberOfPages: 11` → `numberOfChapters: 11`.
    - `sitemap.xml`: add `/chapter/1`, `/vault`, `/mint`; remove `/auth`.

15. **Mobile nav**: `FloatingNav` mobile view = 4 tabs (Home, Library|Unlock, Vault, Codes) + More sheet (Quote Vault, Mint, Privacy, Terms, Refund, About/Sign out). Tap targets ≥44×44. Verified at 320px.

## Phase 4 — Tests

16. Vitest units for `safeNext`, `userStorage`, access state reducer, reduced-motion hook. Deno tests for send-transactional-email 403, verify-paypal amount/currency/user validation and idempotency. Playwright specs for landing→auth→unlock signed-out redirect and reading-progress isolation across two users. Delete `src/test/example.test.ts`.

## Phase 5 — Verify

Build, lint, `bunx vitest run`, `supabase--test_edge_functions`. Fix new failures; report pre-existing.

## Deliverables

Final summary lists: files modified, test outcomes, pre-existing failures, and the exact PayPal dashboard config still required — namely creating a webhook subscription in the PayPal dashboard pointing at the deployed `paypal-webhook` URL for events `PAYMENT.CAPTURE.COMPLETED`, `PAYMENT.CAPTURE.REFUNDED`, `PAYMENT.CAPTURE.REVERSED`, `PAYMENT.CAPTURE.DENIED`, `CUSTOMER.DISPUTE.CREATED`, and storing the resulting Webhook ID as `PAYPAL_WEBHOOK_ID` (plus optional `PAYPAL_ENV=live|sandbox`) in Project Settings → Secrets.

---

This is a big change surface. Approve and I'll implement in the order above, or tell me to trim/re-scope (e.g., defer webhook, defer mobile nav rework).
