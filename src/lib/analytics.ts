import { supabase } from '@/integrations/supabase/client';

export const trackEvent = async (
  eventName: string,
  properties: Record<string, unknown> = {}
) => {
  try {
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
