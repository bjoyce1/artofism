import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import FloatingNav from '@/components/FloatingNav';
import SEO from '@/components/SEO';

// NOTE: Spec called for Cormorant Garamond italic for quote text.
// The site already loads Playfair Display as its display serif, so per the
// spec's fallback rule we use Playfair Display italic for quote text here.

interface VaultQuote {
  id: string;
  code_number: number;
  quote_text: string;
  chapter_slug: string;
  chapter_title: string;
  is_free: boolean;
}

// Day count since Jan 1 2026 (UTC) — same quote for every visitor on a given day.
const EPOCH = Date.UTC(2026, 0, 1);
const dayIndex = () => Math.floor((Date.now() - EPOCH) / 86_400_000);

const formatToday = () =>
  new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

const normalizeSearch = (q: string) => q.trim().toLowerCase().replace(/^no\.?\s*/, '');

const QuoteVaultPage = () => {
  const [quotes, setQuotes] = useState<VaultQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChapter, setActiveChapter] = useState<string>('All');
  const [search, setSearch] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('vault_quotes')
        .select('id, code_number, quote_text, chapter_slug, chapter_title, is_free')
        .order('code_number', { ascending: true });
      if (cancelled) return;
      if (!error && data) setQuotes(data as VaultQuote[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const chapters = useMemo(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const q of quotes) {
      if (!seen.has(q.chapter_title)) {
        seen.add(q.chapter_title);
        ordered.push(q.chapter_title);
      }
    }
    return ordered;
  }, [quotes]);

  const dailyQuote = useMemo(() => {
    if (quotes.length === 0) return null;
    const idx = ((dayIndex() % quotes.length) + quotes.length) % quotes.length;
    return quotes[idx];
  }, [quotes]);

  const filtered = useMemo(() => {
    const term = normalizeSearch(search);
    return quotes.filter((q) => {
      if (activeChapter !== 'All' && q.chapter_title !== activeChapter) return false;
      if (!term) return true;
      if (q.quote_text.toLowerCase().includes(term)) return true;
      if (String(q.code_number) === term) return true;
      if (String(q.code_number).includes(term)) return true;
      return false;
    });
  }, [quotes, activeChapter, search]);

  return (
    <div style={{ backgroundColor: '#050505', minHeight: '100vh' }}>
      <SEO
        title="The Quote Vault"
        description="Standalone codes pulled from across The Art of ISM. One surfaces on its own each day."
        path="/vault"
      />
      <FloatingNav />

      <main className="pt-28 pb-32 px-6">
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Header */}
          <header className="text-center mb-12">
            <h1
              style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                color: '#ece6d9',
                fontSize: 38,
                fontWeight: 400,
                lineHeight: 1.2,
                margin: 0,
              }}
              className="md:text-[38px] text-3xl"
            >
              The Quote Vault
            </h1>
            <p
              style={{ color: '#8d8674', marginTop: 14, fontSize: 15, lineHeight: 1.6 }}
              className="max-w-xl mx-auto"
            >
              Standalone codes pulled from across the book. One surfaces on its own each day.
            </p>
          </header>

          {/* Daily plate */}
          {dailyQuote && (
            <DailyPlate quote={dailyQuote} total={quotes.length} />
          )}

          {/* Filters + search */}
          <div className="mt-12 mb-8 flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <FilterPill
                label="All"
                active={activeChapter === 'All'}
                onClick={() => setActiveChapter('All')}
              />
              {chapters.map((c) => (
                <FilterPill
                  key={c}
                  label={c}
                  active={activeChapter === c}
                  onClick={() => setActiveChapter(c)}
                />
              ))}
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search quotes or code number"
              style={{
                width: '100%',
                background: '#0a0a0a',
                border: '1px solid #3a352a',
                color: '#ece6d9',
                padding: '12px 16px',
                borderRadius: 6,
                fontSize: 14,
                outline: 'none',
              }}
            />
          </div>

          {/* Grid */}
          {loading ? (
            <p style={{ color: '#8d8674', textAlign: 'center', padding: '40px 0' }}>Loading codes…</p>
          ) : filtered.length === 0 ? (
            <p style={{ color: '#8d8674', textAlign: 'center', padding: '40px 0' }}>
              No codes match that search.
            </p>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
              style={{ gap: 14 }}
            >
              {filtered.map((q) => (
                <GridPlate key={q.id} quote={q} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const DailyPlate = ({ quote, total }: { quote: VaultQuote; total: number }) => (
  <article
    style={{
      background: '#0a0a0a',
      border: '1px solid #c9a227',
      borderRadius: 6,
      padding: '32px 28px',
    }}
  >
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 12,
        color: '#9a8443',
        fontSize: 10,
        letterSpacing: '2.5px',
        textTransform: 'uppercase',
        marginBottom: 20,
      }}
    >
      <span>Today's code · {formatToday()}</span>
      <span>No. {quote.code_number} of {total}</span>
    </div>
    <p
      style={{
        fontFamily: '"Playfair Display", Georgia, serif',
        fontStyle: 'italic',
        fontWeight: 500,
        fontSize: 26,
        lineHeight: 1.45,
        color: '#ddd5c2',
        margin: 0,
      }}
    >
      {quote.quote_text}
    </p>
    <div
      style={{
        marginTop: 24,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#9a8443',
        fontSize: 10,
        letterSpacing: '2.5px',
        textTransform: 'uppercase',
      }}
    >
      <span>No. {quote.code_number} · {quote.chapter_title}</span>
      <span aria-hidden="true" />
    </div>
  </article>
);

const GridPlate = ({ quote }: { quote: VaultQuote }) => {
  const [hover, setHover] = useState(false);
  return (
    <article
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: '#0a0a0a',
        border: `1px solid ${hover ? '#c9a227' : '#3a352a'}`,
        borderRadius: 6,
        padding: 22,
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 200ms ease',
        minHeight: 220,
      }}
    >
      <p
        style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontStyle: 'italic',
          fontWeight: 500,
          fontSize: 18,
          lineHeight: 1.5,
          color: '#ddd5c2',
          margin: 0,
          flex: 1,
        }}
      >
        {quote.quote_text}
      </p>
      <div
        style={{
          marginTop: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          color: '#9a8443',
          fontSize: 10,
          letterSpacing: '2.5px',
          textTransform: 'uppercase',
        }}
      >
        <span>No. {quote.code_number} · {quote.chapter_title}</span>
        {/* Phase 2: action icons go here */}
        <span aria-hidden="true" />
      </div>
    </article>
  );
};

const FilterPill = ({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    style={{
      padding: '8px 16px',
      borderRadius: 999,
      textTransform: 'uppercase',
      letterSpacing: '2.5px',
      fontSize: 10,
      cursor: 'pointer',
      transition: 'background-color 200ms, color 200ms, border-color 200ms',
      background: active ? '#c9a227' : 'transparent',
      color: active ? '#1c1503' : '#b6ae99',
      border: active ? '1px solid #c9a227' : '1px solid #3a352a',
    }}
  >
    {label}
  </button>
);

export default QuoteVaultPage;
