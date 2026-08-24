import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { nsGetJson, nsSetJson } from '@/lib/userStorage';

export interface Announcement {
  id: string;
  title: string;
  body: string;
  link_label: string | null;
  link_url: string | null;
  published_at: string;
}

export const DISMISSED_KEY = 'dismissed-announcements';

/** Local dismissal list. Used for guests and as an instant-feedback cache for
 *  signed-in readers (cloud dismissals are the source of truth for them). */
export function readLocalDismissals(): string[] {
  const value = nsGetJson<unknown>(DISMISSED_KEY, []);
  return Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];
}

export function addLocalDismissal(id: string): string[] {
  const next = Array.from(new Set([...readLocalDismissals(), id]));
  nsSetJson(DISMISSED_KEY, next);
  return next;
}

export function isDismissed(id: string, dismissed: string[]): boolean {
  return dismissed.includes(id);
}

export function useAnnouncement() {
  const { user } = useAuth();
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from('announcements')
        .select('id, title, body, link_label, link_url, published_at')
        .eq('active', true)
        .order('published_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (cancelled) return;
      setAnnouncement((data as Announcement) ?? null);

      let ids = readLocalDismissals();
      if (user && data) {
        const { data: rows } = await supabase
          .from('announcement_dismissals')
          .select('announcement_id')
          .eq('user_id', user.id);
        if (rows) ids = Array.from(new Set([...ids, ...rows.map((r) => r.announcement_id)]));
      }

      if (cancelled) return;
      setDismissed(ids);
      setLoading(false);
    })().catch(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [user?.id, user]);

  const dismiss = useCallback(
    async (id: string) => {
      setDismissed(addLocalDismissal(id));
      if (user) {
        await supabase
          .from('announcement_dismissals')
          .insert({ user_id: user.id, announcement_id: id })
          .then(() => undefined, () => undefined);
      }
    },
    [user]
  );

  const visible = !loading && announcement && !isDismissed(announcement.id, dismissed)
    ? announcement
    : null;

  return { announcement: visible, dismiss, loading };
}
