# Reader Announcements: In-App Banner + Opt-In Detail Email

Goal: let you post an update (new narration, new chapter, bonus drop) that every registered reader sees in the app, and let an individual reader request that update by email with one tap.

Important boundary: the app will not blast the same email to your whole reader list — that is marketing email, which isn't supported here and would damage the deliverability of your purchase and login emails. The email in this plan is sent only when a specific reader taps "Email me the details" on the announcement, which makes it a legitimate app email triggered by their own action. For a true announcement blast to everyone, use a dedicated marketing service (Mailchimp, Beehiiv, Kit) with an exported list.

## What you get

1. **Announcements you control from the database** — title, body, optional link label/URL, publish date, active flag. No code change needed to post a new one.
2. **In-app banner** — a dismissible gold-accented bar in the site's existing dark/crimson style, shown on Home, Library, Vault, Codes, and the chapter reader. Dismissal is remembered per reader (per announcement, so a new one shows again).
3. **"What's new" panel** — tapping the banner opens a dialog with the full announcement text, the optional link button, and an **Email me the details** button.
4. **Opt-in announcement email** — tapping that button sends that one reader a branded email with the announcement content, using your existing verified sender (notify.theartofism.com). Idempotent, so repeat taps don't duplicate.

## How you post an update

Tell me the title/body/link and I add the row, or you can add it directly in the backend `announcements` table and set `active = true`. The banner appears for readers immediately.

## Technical details

**Database migration**
- `public.announcements`: `id uuid pk`, `title text`, `body text`, `link_label text null`, `link_url text null`, `active boolean default true`, `published_at timestamptz default now()`, `created_at`. GRANT `SELECT` to `anon, authenticated`; `ALL` to `service_role`. RLS on; policy: anyone may read rows where `active = true`. No client writes.
- `public.announcement_dismissals`: `user_id uuid references auth.users on delete cascade`, `announcement_id uuid references announcements on delete cascade`, `dismissed_at`, unique `(user_id, announcement_id)`. GRANT `SELECT, INSERT, DELETE` to `authenticated`; `ALL` to `service_role`. RLS: reader may only see/insert their own rows.

**Frontend**
- `src/hooks/useAnnouncement.ts` — fetches the newest active announcement, joins the reader's dismissal (falls back to `userStorage` namespaced key for signed-out visitors).
- `src/components/AnnouncementBanner.tsx` — banner + shadcn `Dialog` (Escape close, focus restore, ≥44px targets, safe-area aware, respects reduced motion). Mounted once inside `App.tsx` above `<Routes>` so it applies to every route without touching page layouts.
- Analytics via existing `trackEvent`: `announcement_view`, `announcement_open`, `announcement_dismiss`, `announcement_email_request`.

**Email**
- New template `supabase/functions/_shared/transactional-email-templates/announcement.tsx` matching the existing Playfair/gold/crimson email styling; registered in `registry.ts` as `announcement`.
- Banner's "Email me the details" calls the existing `send-transactional-email` function with `templateName: 'announcement'`, the signed-in reader's own address, `idempotencyKey: announcement-<announcementId>-<userId>`, and `templateData` = title/body/link. Suppression list and unsubscribe footer are handled by the existing infrastructure. Button is shown only to signed-in readers.
- Redeploy the email functions after the template is added.

**Tests**
- Vitest: dismissal-state logic (per-announcement, signed-in vs guest namespacing).
- Playwright smoke: with a seeded announcement, banner is visible, dialog opens, Escape closes and restores focus, no horizontal overflow at 320px.

Then run type-check, build, lint, Vitest, and Playwright. No deploy to production unless you ask.
