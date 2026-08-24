import { useState } from 'react';
import { Megaphone, X, Mail } from 'lucide-react';
import SEO from '@/components/SEO';

/**
 * Pre-publish preview for announcements: shows the in-app banner + details
 * dialog, and a faithful mock of the announcement email, side by side.
 * Presentation only — nothing here writes to the backend or sends email.
 */
const AnnouncementPreview = () => {
  const [title, setTitle] = useState('Chapter narration is live');
  const [body, setBody] = useState(
    'Every chapter now has full narration by Mr. CAP.\n\nOpen your library to listen while you read.'
  );
  const [linkLabel, setLinkLabel] = useState('Open the library');
  const [linkUrl, setLinkUrl] = useState('/library');

  const paragraphs = body
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  const subject = title
    ? `${title} — The Art of ISM`
    : 'An update from The Art of ISM';

  const field =
    'w-full rounded-md border border-border bg-background px-3 py-2 font-body text-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60';
  const label = 'font-ui text-[11px] uppercase tracking-[0.25em] text-muted-foreground';

  return (
    <>
      <SEO
        title="Announcement preview — The Art of ISM"
        description="Preview how an announcement renders in the app banner and in the reader email before publishing."
        noindex
      />
      <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <p className={label}>Internal tool</p>
        <h1 className="mt-2 font-display text-3xl text-primary sm:text-4xl">
          Announcement preview
        </h1>
        <p className="mt-3 max-w-2xl font-body text-[15px] leading-relaxed text-foreground/80">
          Type the announcement below to see exactly how it renders in the site
          banner, in the details dialog, and in the reader email. Nothing is
          saved or sent from this page.
        </p>

        <div className="mt-10 grid gap-10 lg:grid-cols-2">
          {/* Editor */}
          <section className="space-y-5" aria-label="Announcement draft">
            <div className="space-y-2">
              <label className={label} htmlFor="ap-title">
                Title
              </label>
              <input id="ap-title" className={field} value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className={label} htmlFor="ap-body">
                Body (blank line = new paragraph)
              </label>
              <textarea
                id="ap-body"
                rows={7}
                className={field}
                value={body}
                onChange={(e) => setBody(e.target.value)}
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2">
                <label className={label} htmlFor="ap-link-label">
                  Link label (optional)
                </label>
                <input
                  id="ap-link-label"
                  className={field}
                  value={linkLabel}
                  onChange={(e) => setLinkLabel(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className={label} htmlFor="ap-link-url">
                  Link URL (optional)
                </label>
                <input
                  id="ap-link-url"
                  className={field}
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                />
              </div>
            </div>
          </section>

          {/* Renders */}
          <section className="space-y-10" aria-label="Rendered previews">
            <div>
              <p className={label}>In-app banner</p>
              <div className="mt-3 rounded-md border border-primary/30 bg-deep-black/95">
                <div className="flex items-center gap-2 px-3 sm:px-6">
                  <div className="flex min-h-[44px] flex-1 items-center gap-2 py-2 text-primary">
                    <Megaphone className="h-4 w-4 shrink-0" aria-hidden="true" />
                    <span className="font-ui text-[11px] uppercase tracking-[0.25em] text-primary/70">
                      New
                    </span>
                    <span className="min-w-0 flex-1 truncate font-body text-sm text-foreground/90">
                      {title || 'Untitled announcement'}
                    </span>
                  </div>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center text-muted-foreground">
                    <X className="h-4 w-4" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <p className={label}>Details dialog</p>
              <div className="mt-3 max-w-lg rounded-lg border border-primary/30 bg-card p-6">
                <h2 className="font-display text-2xl text-primary">
                  {title || 'Untitled announcement'}
                </h2>
                <div className="mt-4 space-y-4">
                  {paragraphs.map((p, i) => (
                    <p key={i} className="font-body text-[15px] leading-relaxed text-foreground/90">
                      {p}
                    </p>
                  ))}
                </div>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  {linkUrl && (
                    <span className="inline-flex min-h-[44px] flex-1 items-center justify-center rounded-md bg-primary px-5 font-ui text-sm font-semibold tracking-wide text-primary-foreground">
                      {linkLabel || 'Open'}
                    </span>
                  )}
                  <span className="inline-flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-md border border-primary px-5 font-ui text-sm font-semibold tracking-wide text-primary">
                    <Mail className="h-4 w-4" aria-hidden="true" />
                    Email me the details
                  </span>
                </div>
              </div>
            </div>

            <div>
              <p className={label}>Reader email</p>
              <p className="mt-2 font-body text-sm text-muted-foreground">
                Subject: <span className="text-foreground/90">{subject}</span>
              </p>
              {/* Mirrors supabase/functions/_shared/transactional-email-templates/announcement.tsx */}
              <div className="mt-3 overflow-hidden rounded-md border border-border bg-white">
                <div style={{ maxWidth: 480, margin: '0 auto', padding: '40px 30px' }}>
                  <p
                    style={{
                      fontSize: 11,
                      letterSpacing: '0.4em',
                      textTransform: 'uppercase',
                      color: '#D4AF37',
                      textAlign: 'center',
                      margin: '0 0 16px',
                      fontFamily: 'Inter, Arial, sans-serif',
                    }}
                  >
                    THE ART OF ISM
                  </p>
                  <hr style={{ borderColor: '#D4AF37', opacity: 0.4, margin: '0 0 30px' }} />
                  <h3
                    style={{
                      fontFamily: "'Playfair Display', Georgia, serif",
                      fontSize: 24,
                      color: '#050505',
                      textAlign: 'center',
                      margin: '0 0 20px',
                    }}
                  >
                    {title || 'An update from The Art of ISM'}
                  </h3>
                  {(paragraphs.length ? paragraphs : ['Open the site to see what’s new.']).map((p, i) => (
                    <p
                      key={i}
                      style={{
                        fontFamily: "'Lora', Georgia, serif",
                        fontSize: 15,
                        color: '#333333',
                        lineHeight: 1.6,
                        textAlign: 'center',
                        margin: '0 0 20px',
                      }}
                    >
                      {p}
                    </p>
                  ))}
                  {linkUrl && (
                    <div style={{ textAlign: 'center', margin: '30px 0' }}>
                      <span
                        style={{
                          backgroundColor: '#7A000C',
                          color: '#F5E7C6',
                          padding: '14px 32px',
                          borderRadius: 6,
                          fontFamily: 'Inter, Arial, sans-serif',
                          fontSize: 14,
                          fontWeight: 'bold',
                          display: 'inline-block',
                        }}
                      >
                        {linkLabel || 'Open'}
                      </span>
                    </div>
                  )}
                  <p
                    style={{
                      fontFamily: 'Inter, Arial, sans-serif',
                      fontSize: 12,
                      color: '#999999',
                      textAlign: 'center',
                      margin: '30px 0 0',
                    }}
                  >
                    You asked for this update from inside The Art of ISM. Reply to this email if you
                    need anything.
                  </p>
                </div>
              </div>
              <p className="mt-2 font-body text-xs text-muted-foreground">
                The unsubscribe footer is appended automatically on send.
              </p>
            </div>
          </section>
        </div>
      </main>
    </>
  );
};

export default AnnouncementPreview;
