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
- [ ] Speed up entrances; normalize heading font, small typography and contrast.
- [ ] Clear mobile hero nav; standardize labeled section narration.
- [ ] Rebuild footer and desktop Unlock presentation; align mobile reader controls.
- [ ] Verify six routes at 375px and 1440px, narration and reading controls; run tests and lint.