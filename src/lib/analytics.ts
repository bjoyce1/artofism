import { supabase } from '@/integrations/supabase/client';

// Client-side analytics. Public events route through the log-analytics Edge
// Function which enforces an allow-list, rate limits per IP, and holds the
// only INSERT privilege on analytics_events. The browser never writes to the
// table directly. PII (emails, order IDs) is never included client-side.

const lastSentAt = new Map<string, number>();
const MIN_INTERVAL_MS = 2000;

export const trackEvent = async (
  eventName: string,
  properties: Record<string, unknown> = {}
) => {
  try {
    const now = Date.now();
    const last = lastSentAt.get(eventName) ?? 0;
    if (now - last < MIN_INTERVAL_MS) return;
    lastSentAt.set(eventName, now);

    // Strip anything that even looks like PII before it leaves the browser.
    const safeProps: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(properties)) {
      const lower = k.toLowerCase();
      if (lower.includes('email') || lower.includes('order')) continue;
      safeProps[k] = v;
    }

    await supabase.functions.invoke('log-analytics', {
      body: { eventName, properties: safeProps },
    });
  } catch {
    // Silent fail — analytics must never break UX.
  }
};
