## Goal
Cut image weight on the landing/share surfaces without changing the cinematic gold + crimson palette or touching any component code. All filenames stay identical so imports keep working.

## Targets and approach

| File | Now | Target | Method |
|---|---|---|---|
| `src/assets/art_of_ism_book_3.webp` (cover, 1200×1800) | 247 KB | ~95–120 KB | Re-encode WebP q78, method=6 |
| `src/assets/hero-bg.webp` (1920×1281) | 98 KB | ~70–85 KB | WebP q72, method=6 |
| `src/assets/mobile-hero-bg.webp` (800×1783) | 47 KB | ~35–42 KB | WebP q72 |
| `src/assets/vault-hero-bg.webp` (1920×1184) | 28 KB | leave / minor | WebP q72 |
| `src/assets/logo.webp` + `ism-logo.webp` (800×533 RGBA) | 120 KB each | ~40–55 KB | WebP q80 lossy w/ alpha (visually identical at this size) |
| `src/assets/album-art.webp` (800×800) | 73 KB | ~50 KB | WebP q78 |
| `src/assets/founders-key.webp` (512×512) | 24 KB | leave | — |
| `public/og-image.jpg` (1200×630) | 99 KB | ~70–85 KB | mozjpeg q82, progressive |
| `public/favicon.ico` (256×256) | 177 KB | ~15 KB | Rebuild as multi-size 16/32/48 ICO |

Tooling: Pillow + `cwebp`/`mozjpeg` via `nix run`. Each output is checked visually (dimensions preserved, no banding in gold gradients) and only kept if it's both smaller and visually equivalent — otherwise the original stays.

## Delivery tweaks (tiny, non-visual)

- Add `<link rel="preload" as="image" href="/src/...hero-bg.webp" fetchpriority="high" media="(min-width: 768px)">` and a mobile counterpart in `index.html` so the LCP image starts downloading before React boots.
- Confirm `<img>` tags for the cover already have `width`/`height` (they do in `AboutAuthorSection`) — no change needed.

## Out of scope
- No AVIF pipeline / `vite-imagetools` install (would touch build config).
- No CDN asset migration.
- No visual redesign — palette and crops are preserved exactly.

## Verification
- `ls -lh` before/after table reported back to you.
- Spot-check rendered hero + cover via Playwright screenshot to confirm no visible degradation.
