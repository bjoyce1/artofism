import { useEffect, useState, useRef } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { trackEvent } from '@/lib/analytics';
import { chapters } from '@/data/bookContent';
import FloatingNav from '@/components/FloatingNav';
import AnimatedSection from '@/components/AnimatedSection';
import { BookOpen, Code2, Quote, Download, Heart, ChevronRight } from 'lucide-react';

const Library = () => {
  const { user, hasAccess, loading, accessLoading, signOut } = useAuth();
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [savedQuotes, setSavedQuotes] = useState<{ quote_text: string; chapter_slug: string | null }[]>([]);
  const [bonusPdfUrl, setBonusPdfUrl] = useState('');
  const trackedRef = useRef(false);

  // Track library enter
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
      .select('chapter_slug, progress_percent')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (data) {
          const map: Record<string, number> = {};
          data.forEach(r => { map[r.chapter_slug] = r.progress_percent; });
          setProgress(map);
        }
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

  const lastChapterSlug = Object.entries(progress).sort(([,a],[,b]) => b - a)[0]?.[0];
  const lastChapter = chapters.find(c => c.number.toString() === lastChapterSlug);

  return (
    <div className="min-h-screen bg-deep-black">
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
            <p className="text-muted-foreground text-lg mb-12">
              Your access is unlocked. Enter the full interactive book experience.
            </p>
          </AnimatedSection>

          {lastChapter && (
            <AnimatedSection delay={50}>
              <Link
                to={`/chapter/${lastChapter.number}`}
                className="block bg-card border border-primary/30 rounded-sm p-6 mb-8 hover:border-primary/50 transition-colors group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-ui text-xs uppercase tracking-[0.3em] text-primary mb-1">Continue Reading</p>
                    <p className="font-display text-xl text-foreground group-hover:text-primary transition-colors">
                      Chapter {lastChapter.number}: {lastChapter.title}
                    </p>
                  </div>
                  <ChevronRight className="text-primary" size={20} />
                </div>
              </Link>
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
              {chapters.map(ch => (
                <Link
                  key={ch.number}
                  to={`/chapter/${ch.number}`}
                  className="flex items-center justify-between p-4 bg-card border border-border rounded-sm hover:border-primary/30 transition-colors group"
                >
                  <div className="flex items-center gap-4">
                    <span className="font-ui text-xs text-primary w-6">{String(ch.number).padStart(2, '0')}</span>
                    <span className="font-display text-foreground group-hover:text-primary transition-colors">{ch.title}</span>
                  </div>
                  {progress[ch.number.toString()] !== undefined && (
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary rounded-full" style={{ width: `${progress[ch.number.toString()]}%` }} />
                      </div>
                      <span className="font-ui text-xs text-muted-foreground">{progress[ch.number.toString()]}%</span>
                    </div>
                  )}
                </Link>
              ))}
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
