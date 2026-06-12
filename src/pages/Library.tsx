import { useEffect, useState, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { trackEvent } from '@/lib/analytics';
import { chapters } from '@/data/bookContent';
import FloatingNav from '@/components/FloatingNav';
import SEO from '@/components/SEO';
import AnimatedSection from '@/components/AnimatedSection';
import { BookOpen, Code2, Quote, Download, Heart, ChevronRight, Check } from 'lucide-react';

interface ProgressRow {
  chapter_slug: string;
  progress_percent: number;
  completed: boolean;
  last_read_at: string | null;
  updated_at: string;
}

const Library = () => {
  const { user, hasAccess, loading, accessLoading, signOut } = useAuth();
  const [rows, setRows] = useState<ProgressRow[]>([]);
  const [savedQuotes, setSavedQuotes] = useState<{ quote_text: string; chapter_slug: string | null }[]>([]);
  const [bonusPdfUrl, setBonusPdfUrl] = useState('');
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!trackedRef.current) {
      trackedRef.current = true;
      trackEvent('library_enter');
    }
  }, []);

  useEffect(() => {
    supabase.functions.invoke('get-config').then(({ data }) => {
      if (data?.bonusPdfUrl) setBonusPdfUrl(data.bonusPdfUrl);
    });
  }, []);

  useEffect(() => {
    if (!user) return;

    supabase
      .from('reading_progress')
      .select('chapter_slug, progress_percent, completed, last_read_at, updated_at')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data) setRows(data as ProgressRow[]);
      });

    supabase
      .from('saved_quotes')
      .select('quote_text, chapter_slug')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => {
        if (data) setSavedQuotes(data);
      });
  }, [user]);

  if (loading || accessLoading) {
    return (
      <div className="min-h-screen bg-deep-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;
  if (!hasAccess) return <Navigate to="/unlock" replace />;

  // Build progress map keyed by chapter number string
  const progressMap: Record<string, ProgressRow> = {};
  rows.forEach(r => { progressMap[r.chapter_slug] = r; });

  const progress: Record<string, number> = {};
  rows.forEach(r => { progress[r.chapter_slug] = r.progress_percent; });

  const totalChapters = chapters.length + 1; // includes introduction
  const completedCount = rows.filter(r => r.completed).length;
  const allChaptersCompleted =
    completedCount >= totalChapters ||
    chapters.every(c => progressMap[c.number.toString()]?.completed);

  // Continue card logic
  const sortedByRecent = [...rows]
    .filter(r => r.last_read_at)
    .sort((a, b) => (b.last_read_at! > a.last_read_at! ? 1 : -1));
  const resumeRow = sortedByRecent.find(r => !r.completed);
  const resumeChapter = resumeRow ? chapters.find(c => c.number.toString() === resumeRow.chapter_slug) : undefined;

  const upNextChapter = !resumeChapter && rows.length > 0 && !allChaptersCompleted
    ? chapters.find(c => !progressMap[c.number.toString()]?.completed) ?? chapters[0]
    : undefined;

  const showContinueCard = rows.length > 0;

  return (
    <div className="min-h-screen bg-deep-black">
      <SEO title="Your Library" description="Your library of chapters and saved quotes from The Art of ISM." path="/library" noindex />
      <FloatingNav />

      <div className="pt-24 pb-32 px-6">
        <div className="max-w-4xl mx-auto">
          <AnimatedSection>
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-ui text-xs uppercase tracking-[0.4em] text-primary mb-2">Your Access is Unlocked</p>
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
                  Welcome to <span className="text-gold-gradient">ISM</span>
                </h1>
              </div>
              <button
                onClick={signOut}
                className="font-ui text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
              >
                Sign Out
              </button>
            </div>
            <p className="text-muted-foreground text-lg mb-3">
              Your access is unlocked. Enter the full interactive book experience.
            </p>
            {completedCount > 0 && (
              <p className="font-ui text-[11px] uppercase tracking-[0.3em] text-muted-foreground mb-12">
                {completedCount} of {totalChapters} chapters read
              </p>
            )}
            {completedCount === 0 && <div className="mb-12" />}
          </AnimatedSection>

          {showContinueCard && (
            <AnimatedSection delay={50}>
              {allChaptersCompleted ? (
                <Link
                  to="/quote-vault"
                  className="block p-6 mb-8 rounded-sm transition-colors"
                  style={{ background: '#0a0a0a', border: '1px solid #c9a227' }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-ui text-[11px] uppercase tracking-[0.3em] mb-2" style={{ color: '#c9a227' }}>
                        Complete
                      </p>
                      <p className="font-display text-xl" style={{ color: '#ece6d9' }}>
                        You've read the code.
                      </p>
                      <p className="font-ui text-[11px] uppercase tracking-[0.3em] mt-2 text-muted-foreground">
                        Enter the Quote Vault
                      </p>
                    </div>
                    <ChevronRight size={20} style={{ color: '#c9a227' }} />
                  </div>
                </Link>
              ) : resumeChapter ? (
                <Link
                  to={`/chapter/${resumeChapter.number}?resume=1`}
                  className="block p-6 mb-8 rounded-sm transition-colors group"
                  style={{ background: '#0a0a0a', border: '1px solid #c9a227' }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-ui text-[11px] uppercase tracking-[0.3em] mb-2" style={{ color: '#c9a227' }}>
                        Continue Reading
                      </p>
                      <p className="font-display text-xl mb-3" style={{ color: '#ece6d9' }}>
                        Chapter {resumeChapter.number}: {resumeChapter.title}
                      </p>
                      <div className="h-[2px] w-full rounded-full overflow-hidden" style={{ background: '#3a352a' }}>
                        <div
                          className="h-full"
                          style={{ width: `${resumeRow!.progress_percent}%`, background: '#c9a227' }}
                        />
                      </div>
                      <p className="font-ui text-[11px] uppercase tracking-[0.3em] mt-2 text-muted-foreground">
                        {resumeRow!.progress_percent}% through
                      </p>
                    </div>
                    <ChevronRight size={20} style={{ color: '#c9a227' }} />
                  </div>
                </Link>
              ) : upNextChapter ? (
                <Link
                  to={`/chapter/${upNextChapter.number}`}
                  className="block p-6 mb-8 rounded-sm transition-colors"
                  style={{ background: '#0a0a0a', border: '1px solid #c9a227' }}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-ui text-[11px] uppercase tracking-[0.3em] mb-2" style={{ color: '#c9a227' }}>
                        Up Next
                      </p>
                      <p className="font-display text-xl" style={{ color: '#ece6d9' }}>
                        Chapter {upNextChapter.number}: {upNextChapter.title}
                      </p>
                    </div>
                    <ChevronRight size={20} style={{ color: '#c9a227' }} />
                  </div>
                </Link>
              ) : null}
            </AnimatedSection>
          )}

          <AnimatedSection delay={100}>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
              <Link to="/chapter/1" className="flex items-center gap-3 p-5 bg-card border border-border rounded-sm hover:border-primary/30 transition-colors">
                <BookOpen size={18} className="text-primary" />
                <span className="text-foreground text-sm font-display">Explore the Chapters</span>
              </Link>
              <Link to="/codes" className="flex items-center gap-3 p-5 bg-card border border-border rounded-sm hover:border-primary/30 transition-colors">
                <Code2 size={18} className="text-primary" />
                <span className="text-foreground text-sm font-display">Open The Codes</span>
              </Link>
              <Link to="/quote-vault" className="flex items-center gap-3 p-5 bg-card border border-border rounded-sm hover:border-primary/30 transition-colors">
                <Quote size={18} className="text-primary" />
                <span className="text-foreground text-sm font-display">Enter the Quote Vault</span>
              </Link>
              {bonusPdfUrl && (
                <a href={bonusPdfUrl} target="_blank" rel="noopener noreferrer" onClick={() => trackEvent('pdf_download')} className="flex items-center gap-3 p-5 bg-card border border-border rounded-sm hover:border-primary/30 transition-colors">
                  <Download size={18} className="text-primary" />
                  <span className="text-foreground text-sm font-display">Download Bonus PDF</span>
                </a>
              )}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={150}>
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">All Chapters</h2>
            <div className="grid gap-3 mb-12">
              {chapters.map(ch => {
                const row = progressMap[ch.number.toString()];
                const pct = row?.progress_percent;
                const isComplete = !!row?.completed;
                const inProgress = !isComplete && typeof pct === 'number' && pct > 0;
                return (
                  <Link
                    key={ch.number}
                    to={`/chapter/${ch.number}`}
                    className="flex items-center justify-between p-4 bg-card border border-border rounded-sm hover:border-primary/30 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4">
                        <span className="font-ui text-xs text-primary w-6">{String(ch.number).padStart(2, '0')}</span>
                        <span
                          className="font-display group-hover:text-primary transition-colors"
                          style={isComplete ? { color: '#ece6d9' } : undefined}
                        >
                          {ch.title}
                        </span>
                        {isComplete && (
                          <Check size={14} style={{ color: '#c9a227' }} aria-label="Completed" />
                        )}
                      </div>
                      {inProgress && (
                        <div className="mt-2 ml-10 h-[2px] w-full max-w-xs rounded-full overflow-hidden" style={{ background: '#3a352a' }}>
                          <div className="h-full" style={{ width: `${pct}%`, background: '#c9a227' }} />
                        </div>
                      )}
                    </div>
                    {typeof pct === 'number' && !isComplete && (
                      <span className="font-ui text-xs text-muted-foreground ml-3 shrink-0">{pct}%</span>
                    )}
                  </Link>
                );
              })}
            </div>
          </AnimatedSection>

          {savedQuotes.length > 0 && (
            <AnimatedSection delay={200}>
              <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                <Heart size={20} className="text-primary" />
                Saved Quotes
              </h2>
              <div className="space-y-3">
                {savedQuotes.map((q, i) => (
                  <div key={i} className="p-4 bg-card border border-border rounded-sm">
                    <p className="text-foreground/90 italic">"{q.quote_text}"</p>
                    {q.chapter_slug && (
                      <p className="font-ui text-xs text-muted-foreground mt-2">Chapter {q.chapter_slug}</p>
                    )}
                  </div>
                ))}
              </div>
            </AnimatedSection>
          )}
        </div>
      </div>
    </div>
  );
};

export default Library;
