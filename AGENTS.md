# Architecture rules
- `/codes` owns its entitlement-based presentation: non-members receive a title-only projection of paid chapter codes; the existing full hub renders only with confirmed access. This keeps navigation public without exposing paid text in the rendered page.
- Public code preview data is projected in `src/lib/codePreview.ts`, excluding the free chapter, so the ten-title boundary is independently testable without changing manuscript content.
- Browser tests use the standard Playwright configuration against the existing local preview, avoiding an unavailable proprietary configuration dependency.
- Homepage introduction uses a clipped, animated inline disclosure with all original paragraphs mounted, so expanding does not navigate or discard searchable text.
- Acknowledgments share flowing-name and album-download components between the homepage preview and lazy-loaded full page, preventing duplicated names or download destinations.
- Code labels are normalized through a shared display formatter while manuscript prose remains unchanged.
- Section narration uses the shared labeled audio button with section-specific accessible names, keeping playback behavior consistent.
- Reader floating controls share a semantic surface and height token, with article bottom clearance for the mobile controls and safe area.
- Shared scroll reveals cap stagger delays and global motion defaults keep entrances fast without altering ambient effects.