# The Art of ISM — Interactive Online Book

A premium interactive book platform for *The Art of ISM* by Mr. CAP: 11 immersive chapters, audiobook narration, the Codes hub, the Quote Vault, and a collectibles Vault — built as a single-page app with gated access.

## Reader features

- **Two reading modes** — "Experience" (cinematic, with smoke overlays and pull quotes) and "Read" (clean text), toggleable and remembered per device
- **Book-wide search** — press `Ctrl+K` / `⌘K` (or the search icon in the nav) to search chapters, passages, and code principles
- **Reading progress** — scroll progress is tracked per chapter, shown on the Table of Contents and Library, and synced to your account when signed in
- **Resume where you left off** — returning to a chapter offers a one-tap jump back to your last position
- **Save quotes** — select any passage in a chapter to save, copy, or share it; saved quotes sync to your account
- **Reader controls** — adjustable text size, keyboard navigation (`←`/`→` between chapters), reading-time estimates
- **Audiobook** — per-chapter narration plus ambient audio

## Stack

- React 18 + TypeScript + Vite
- Tailwind CSS + shadcn/ui (Radix primitives), framer-motion
- Supabase (auth via magic link, entitlements, reading progress, saved quotes, edge functions for email + PayPal verification)
- react-router, TanStack Query, react-helmet-async

## Development

```sh
npm install
npm run dev        # start dev server
npm run build      # production build
npm test           # run vitest unit tests
npm run lint       # eslint
```

## Project layout

- `src/pages` — routed pages (landing, chapter reader, library, vault, auth, checkout)
- `src/components` — UI sections and shared components (`ui/` is shadcn)
- `src/data/bookContent.ts` — the book's full text content
- `src/hooks` — reading progress/favorites (localStorage + Supabase sync), auth, audio
- `supabase/` — migrations and edge functions

## Access model

Chapter 1 is free. The remaining chapters, the Codes hub, and the Quote Vault require a signed-in user with the `art-of-ism-full-access` entitlement (granted after PayPal purchase verification).
