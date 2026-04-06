

# Analytics Event Tracking for The Art of ISM

## What this does

Adds lightweight custom event tracking across the funnel so you can see exactly where visitors drop off — from browsing to buying to reading.

## Events tracked

| Event | Where it fires | What it tells you |
|---|---|---|
| `unlock_page_view` | `/unlock` page mount | How many people hit the buy page |
| `get_book_click` | Homepage CTA ("Get the Book") | Interest from homepage |
| `checkout_start` | PayPal button `createOrder` | How many start paying |
| `checkout_success` | PayPal `onApprove` success | How many finish paying |
| `library_enter` | `/library` page mount | How many access the product |
| `chapter_locked_view` | Lock screen mount | How many hit the paywall |
| `pdf_download` | Bonus PDF link click | Engagement with bonus content |

## Technical approach

**1. Create a thin analytics utility** (`src/lib/analytics.ts`)
- Single `trackEvent(name, properties?)` function
- Stores events in a `analytics_events` database table
- Falls back silently on error so it never breaks the UX
- Includes user ID (if authenticated) and timestamp

**2. Create the `analytics_events` table**
- Columns: `id`, `event_name`, `user_id` (nullable), `properties` (jsonb), `created_at`
- RLS: insert allowed for both anon and authenticated; select restricted to service role only
- This keeps data private while allowing any visitor to emit events

**3. Instrument each event** (one-line additions to existing components)
- `Unlock.tsx` — `useEffect` fires `unlock_page_view` on mount
- `Unlock.tsx` — `createOrder` callback fires `checkout_start`
- `Unlock.tsx` — `onApprove` success path fires `checkout_success`
- `FinalCTA.tsx` — CTA link click fires `get_book_click`
- `Library.tsx` — `useEffect` fires `library_enter` on mount
- `LockScreen.tsx` — `useEffect` fires `chapter_locked_view` on mount
- `Library.tsx` — Bonus PDF link click fires `pdf_download`

**4. Files changed**
- **New**: `src/lib/analytics.ts` (tracking utility)
- **New migration**: `analytics_events` table + RLS policies
- **Edit**: `src/pages/Unlock.tsx` (3 events)
- **Edit**: `src/pages/Library.tsx` (2 events)
- **Edit**: `src/components/LockScreen.tsx` (1 event)
- **Edit**: `src/components/FinalCTA.tsx` (1 event)

