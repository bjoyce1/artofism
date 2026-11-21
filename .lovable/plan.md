# Restore older email unsubscribe links safely

## Verified result
- PayPal checkout currently creates a real order and opens the PayPal payment window. No checkout change is needed; its monitoring finding is resolved as stale.
- Older emails point to the site's `/unsubscribe` page, which still calls a deleted service. That service returns HTTP 404, so those links cannot complete an opt-out.
- New app emails already use Lovable-hosted unsubscribe links and managed suppression.

## Proposed work
1. Establish whether Lovable-managed email preferences support a handoff from an older unsubscribe token. This is a blocking prerequisite: the available documentation does not expose a legacy-token conversion or suppression-write API.
2. If a supported handoff exists, add the smallest compatibility bridge for already-sent links. Validate the old token on the server and use only the documented hosted destination; never expose recipient information or claim success without a confirmed opt-out.
3. Verify an actual old link through confirmation, then verify the recipient is suppressed by managed delivery. Keep new email sending and sign-in emails unchanged.
4. Add a focused regression test for the handoff and its invalid-token behavior. Resolve the unsubscribe finding as fixed only after the complete opt-out is verified.

## Safety boundaries
- Do not rebuild the deleted email queue, token tables, or suppression tables.
- Do not invent a hosted preference URL, token mapping, or API.
- Do not replace a broken link with a false success message.
- If no supported handoff is available, leave the issue unresolved and report the compatibility limitation rather than implementing an ineffective opt-out.

## Technical details
- Affected existing page: `src/pages/Unsubscribe.tsx`.
- Missing legacy service: `handle-email-unsubscribe`.
- Checkout and payment capture remain unchanged.