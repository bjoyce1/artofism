# Design cleanup — Round 1
- [x] Rebuild mobile hero and simplify desktop hero with labeled narration.
- [x] Unify all free-chapter CTAs to /chapter/1.
- [x] Clarify narrated TOC and free/locked chapter states.
- [x] Add public title-only Codes teaser; preserve member hub.
- [x] Remove search shortcut badge.
- [x] Verify target viewports, real member access, audio playback, 37 unit tests, and 23 browser tests.
- [x] Run lint: 25 existing errors and 13 warnings remain outside this design-only scope; no new issues in cleanup code.

# Design cleanup — Round 2
- [x] Collapse the homepage introduction inline, preserving full text and audio.
- [x] Add full acknowledgments page, sitemap/footer links, and compact homepage names (498px at 375px).
- [x] Keep the homepage tagline only in FinalCTA; feature the first quote and retain actions.
- [x] Normalize displayed code titles and homepage spacing.
- [x] Verify heights: 8,934px at 375×812; 6,827px at 1440×900; no horizontal overflow or runtime errors.
- [x] Verify inline expansion/collapse, quote favorite/copy/share, and acknowledgments navigation; 39 unit and 27 browser tests pass, latest build clean.
- [x] Run lint: same 25 pre-existing errors and 13 warnings; no new issues.

# Design cleanup — Round 3
- [x] Speed up entrances; normalize heading font, small typography and contrast.
- [x] Clear mobile hero nav; standardize labeled section narration, verified real playback and pause.
- [x] Rebuild footer and desktop Unlock presentation; align mobile reader controls above a reserved bottom strip.
- [x] Verify six routes at 375px and 1440px: no horizontal overflow or text below 11px; above-fold entrances visible after 600ms. Solid-surface text contrast exceeds 4.5:1; decorative watermarks and image/gradient text excluded from numeric audit.
- [x] Homepage after fonts load: 8,968px mobile and 7,201px desktop, within existing budgets.
- [x] All 39 unit and 27 browser tests pass; preview build clean. Lint retains the same 25 existing errors and 13 warnings.

# Magic UI effects
- [x] Add subtle price-card beam, fine-pointer TOC spotlight, and short closing text reveal with reduced-motion alternatives.
- [x] Add a once-per-confirmed-order celebration without changing purchase logic; verified real completed purchase paints confetti and refresh stays blank, signed-out visits never claim an order.
- [x] Verify 375px/1440px with no overflow, no card shift, touch spotlight disabled and desktop card above fold. Homepage 9,337px (+535px) mobile / 7,643px (+580px) desktop. Height caps keep the sticky reveal within the 600px increase budget.
- [x] All 47 unit and 29 browser tests pass; preview build clean. Lint unchanged: 25 pre-existing errors and 13 warnings; new effect files lint clean.