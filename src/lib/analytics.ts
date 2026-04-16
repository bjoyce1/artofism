import { supabase } from '@/integrations/supabase/client';

// Simple per-event throttle so a single tab can't spam the analytics table.
// Different events still send freely; same event won't repeat within 2s.
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

    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from('analytics_events' as any).insert({
      event_name: eventName,
      user_id: user?.id ?? null,
      properties,
    });
  } catch {
    // Silent fail — analytics should never break UX
  }
};
