import { useEffect, useRef, useState } from 'react';
import { Megaphone, X, Mail, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useAnnouncement } from '@/hooks/useAnnouncement';
import { trackEvent } from '@/lib/analytics';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

/**
 * Site-wide "What's new" banner. Announcements are managed in the backend;
 * a signed-in reader can request the details by email for themselves.
 */
const AnnouncementBanner = () => {
  const { announcement, dismiss } = useAnnouncement();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const viewedRef = useRef<string | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (announcement && viewedRef.current !== announcement.id) {
      viewedRef.current = announcement.id;
      trackEvent('announcement_view');
    }
  }, [announcement]);

  if (!announcement) return null;

  const handleOpen = () => {
    setOpen(true);
    trackEvent('announcement_open');
  };

  const handleDismiss = () => {
    trackEvent('announcement_dismiss');
    void dismiss(announcement.id);
  };

  const handleEmail = async () => {
    setSending(true);
    try {
      const { error } = await supabase.functions.invoke('request-announcement-email', {
        body: { announcementId: announcement.id },
      });
      if (error) throw error;
      setSent(true);
      trackEvent('announcement_email_request');
      toast.success('Sent — check your inbox for the details.');
    } catch {
      toast.error("Couldn't send that email right now. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const paragraphs = announcement.body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <>
      {/* Anchored to the bottom so it never collides with the fixed top nav. */}
      <div
        role="region"
        aria-label="Site announcement"
        className="fixed bottom-0 left-0 right-0 z-50 w-full border-t border-primary/30 bg-deep-black/95 backdrop-blur-md"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mx-auto flex max-w-5xl items-center gap-2 px-3 sm:px-6">
          <button
            type="button"
            ref={triggerRef}
            onClick={handleOpen}
            aria-label={`What's new: ${announcement.title}. Open details.`}
            className="flex min-h-[44px] flex-1 items-center gap-2 py-2 text-left text-primary transition-colors hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <Megaphone className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="font-ui text-[11px] uppercase tracking-[0.25em] text-primary/70">
              New
            </span>
            <span className="min-w-0 flex-1 truncate font-body text-sm text-foreground/90">
              {announcement.title}
            </span>
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss announcement"
            className="flex h-11 w-11 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          // Focus is restored manually because the trigger lives outside the
          // Dialog (the banner is fixed, the dialog is controlled).
          if (!next) requestAnimationFrame(() => triggerRef.current?.focus());
        }}
      >
        <DialogContent className="max-w-lg border-primary/30 bg-card">
          <DialogHeader>
            <DialogTitle className="font-display text-2xl text-primary">
              {announcement.title}
            </DialogTitle>
            <DialogDescription className="sr-only">
              Details of the latest update
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {paragraphs.map((p, i) => (
              <p key={i} className="font-body text-[15px] leading-relaxed text-foreground/90">
                {p}
              </p>
            ))}
          </div>

          <div className="mt-2 flex flex-col gap-3 sm:flex-row">
            {announcement.link_url && (
              <a
                href={announcement.link_url}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-md bg-primary px-5 font-ui text-sm font-semibold tracking-wide text-primary-foreground transition-opacity hover:opacity-90"
              >
                {announcement.link_label || 'Open'}
              </a>
            )}
            {user && (
              <button
                type="button"
                onClick={handleEmail}
                disabled={sending || sent}
                className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-md border border-primary px-5 font-ui text-sm font-semibold tracking-wide text-primary transition-colors hover:bg-primary/10 disabled:opacity-60"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Mail className="h-4 w-4" aria-hidden="true" />
                )}
                {sent ? 'Email sent' : 'Email me the details'}
              </button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AnnouncementBanner;
