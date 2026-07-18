import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Copy, Share2, Star, Search, RotateCw, Lock, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useReadingProgress';
import FloatingNav from '@/components/FloatingNav';
import SEO from '@/components/SEO';

interface VaultQuote {
  id: string;
  code_number: number;
  quote_text: string;
  chapter_slug: string;
  chapter_title: string;
  is_free: boolean;
}

const EPOCH = Date.UTC(2026, 0, 1);
const dayIndex = () => Math.floor((Date.now() - EPOCH) / 86_400_000);

const formatToday = () =>
  new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

const normalizeSearch = (q: string) => q.trim().toLowerCase().replace(/^no\.?\s*/, '');

const QuoteVaultPage = () => {
  const { hasAccess } = useAuth();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [quotes, setQuotes] = useState<VaultQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChapter, setActiveChapter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [spinKey, setSpinKey] = useState(0);

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
      if (activeChapter === 'My stash') {
        if (!isFavorite(q.quote_text)) return false;
      } else if (activeChapter !== 'All' && q.chapter_title !== activeChapter) {
        return false;
      }
      if (!term) return true;
      if (q.quote_text.toLowerCase().includes(term)) return true;
      if (String(q.code_number).includes(term)) return true;
      return false;
    });
  }, [quotes, activeChapter, search, isFavorite, spinKey]);

  const lockedCount = useMemo(
    () => (hasAccess ? 0 : quotes.filter((q) => !q.is_free).length),
    [quotes, hasAccess]
  );

  const handleCopy = (q: VaultQuote) => {
    navigator.clipboard.writeText(`"${q.quote_text}" — The Art of ISM, ${q.chapter_title}`);
    setCopiedId(q.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const handleShare = async (q: VaultQuote) => {
    const text = `"${q.quote_text}" — The Art of ISM`;
    if (navigator.share) {
      try {
        await navigator.share({ text });
        return;
      } catch {}
    }
    handleCopy(q);
  };

  const spinTheDial = () => {
    setSpinKey((k) => k + 1);
    const pool = filtered.length ? filtered : quotes;
    if (!pool.length) return;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    const el = document.getElementById(`vault-quote-${pick.id}`);
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el?.animate(
      [
        { boxShadow: '0 0 0 0 rgba(201,162,39,0)' },
        { boxShadow: '0 0 0 4px rgba(201,162,39,0.45)' },
        { boxShadow: '0 0 0 0 rgba(201,162,39,0)' },
      ],
      { duration: 1200, easing: 'ease-out' }
    );
  };

  return (
    <div style={{ backgroundColor: '#050505', minHeight: '100vh' }}>
      <SEO
        title="The Quote Vault"
        description="Standalone codes pulled from across The Art of ISM. One surfaces on its own each day."
        path="/vault"
      />
      <FloatingNav />

      <main className="pt-24 pb-24 px-4 sm:px-6">
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          {/* Header */}
          <header className="text-center mb-10">
            <p
              style={{
                fontSize: 11,
                letterSpacing: 3,
                color: '#c9a227',
                textTransform: 'uppercase',
                margin: '0 0 10px',
              }}
            >
              It's all ISM
            </p>
            <h1
              style={{
                fontFamily: '"Playfair Display", Georgia, serif',
                color: '#ece6d9',
                fontWeight: 500,
                lineHeight: 1.1,
                margin: '0 0 12px',
              }}
              className="text-3xl sm:text-[38px]"
            >
              The Quote Vault
            </h1>
            <p
              style={{ color: '#8d8674', fontSize: 13, lineHeight: 1.6 }}
              className="max-w-md mx-auto"
            >
              Standalone codes pulled from across the book.<br className="hidden sm:inline" />
              {' '}One surfaces on its own each day.
            </p>
          </header>

          {/* Daily plate */}
          {dailyQuote && <DailyPlate quote={dailyQuote} total={quotes.length} onCopy={handleCopy} onShare={handleShare} copied={copiedId === dailyQuote.id} />}

          {/* Filter pills + spin */}
          <div className="mt-8 mb-4 flex flex-wrap items-center gap-2">
            <FilterPill label="All" active={activeChapter === 'All'} onClick={() => setActiveChapter('All')} />
            <FilterPill
              label="My stash"
              icon={<Star size={11} />}
              active={activeChapter === 'My stash'}
              onClick={() => setActiveChapter('My stash')}
            />
            {chapters.map((c) => (
              <FilterPill key={c} label={c} active={activeChapter === c} onClick={() => setActiveChapter(c)} />
            ))}
            <span style={{ flex: 1 }} />
            <button
              onClick={spinTheDial}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 11,
                padding: '7px 14px',
                border: '1px solid #c9a227',
                borderRadius: 999,
                color: '#c9a227',
                letterSpacing: 1,
                textTransform: 'uppercase',
                background: 'transparent',
                cursor: 'pointer',
              }}
            >
              <RotateCw size={12} /> Spin the dial
            </button>
          </div>

          {/* Search */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              border: '1px solid #2c2920',
              borderRadius: 6,
              padding: '9px 14px',
              color: '#6a6452',
              marginBottom: 18,
            }}
          >
            <Search size={15} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search the codes"
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#ece6d9',
                fontSize: 13,
              }}
            />
          </div>

          {/* Grid */}
          {loading ? (
            <p style={{ color: '#8d8674', textAlign: 'center', padding: '40px 0' }}>Loading codes…</p>
          ) : filtered.length === 0 ? (
            <p style={{ color: '#8d8674', textAlign: 'center', padding: '40px 0' }}>
              No codes match.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: 14 }}>
              {filtered.map((q) => (
                <GridPlate
                  key={q.id}
                  quote={q}
                  locked={!hasAccess && !q.is_free}
                  favorited={isFavorite(q.quote_text)}
                  copied={copiedId === q.id}
                  onFavorite={() => toggleFavorite(q.quote_text, q.chapter_slug)}
                  onCopy={() => handleCopy(q)}
                  onShare={() => handleShare(q)}
                />
              ))}
            </div>
          )}

          {/* Unlock banner */}
          {!hasAccess && lockedCount > 0 && (
            <div
              style={{
                marginTop: 22,
                border: '1px solid #c9a227',
                borderRadius: 6,
                padding: '18px 24px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 16,
                background: '#0d0b06',
                flexWrap: 'wrap',
              }}
            >
              <p style={{ margin: 0, fontSize: 13, color: '#d8cfb6', lineHeight: 1.5 }}>
                {lockedCount} more codes live behind the vault door.
              </p>
              <Link
                to="/unlock"
                style={{
                  whiteSpace: 'nowrap',
                  fontSize: 11,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  background: '#c9a227',
                  color: '#1c1503',
                  padding: '10px 18px',
                  borderRadius: 4,
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                Unlock the book
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

const DailyPlate = ({
  quote,
  total,
  onCopy,
  onShare,
  copied,
}: {
  quote: VaultQuote;
  total: number;
  onCopy: (q: VaultQuote) => void;
  onShare: (q: VaultQuote) => void;
  copied: boolean;
}) => (
  <article
    id={`vault-quote-${quote.id}`}
    style={{
      border: '1px solid #c9a227',
      borderRadius: 6,
      padding: '28px 32px',
      background: '#0a0a0a',
    }}
  >
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, gap: 12 }}>
      <span style={{ fontSize: 10, letterSpacing: 2.5, color: '#c9a227', textTransform: 'uppercase' }}>
        Today's code · {formatToday()}
      </span>
      <span style={{ fontSize: 10, letterSpacing: 2, color: '#5f5a4c', textTransform: 'uppercase' }}>
        No. {quote.code_number} of {total}
      </span>
    </div>
    <p
      style={{
        margin: '0 0 18px',
        fontFamily: '"Playfair Display", Georgia, serif',
        fontSize: 25,
        fontStyle: 'italic',
        color: '#ece6d9',
        lineHeight: 1.45,
      }}
    >
      "{quote.quote_text}"
    </p>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 10, letterSpacing: 2, color: '#9a8443', textTransform: 'uppercase' }}>
        {quote.chapter_title}
      </span>
      <span style={{ display: 'inline-flex', gap: 14, color: '#c9a227' }}>
        <button onClick={() => onCopy(quote)} aria-label="Copy" style={iconBtn}>
          {copied ? <Check size={16} /> : <Copy size={16} />}
        </button>
        <button onClick={() => onShare(quote)} aria-label="Share" style={iconBtn}>
          <Share2 size={16} />
        </button>
      </span>
    </div>
  </article>
);

const GridPlate = ({
  quote,
  locked,
  favorited,
  copied,
  onFavorite,
  onCopy,
  onShare,
}: {
  quote: VaultQuote;
  locked: boolean;
  favorited: boolean;
  copied: boolean;
  onFavorite: () => void;
  onCopy: () => void;
  onShare: () => void;
}) => {
  const [hover, setHover] = useState(false);
  return (
    <article
      id={`vault-quote-${quote.id}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        border: `1px solid ${locked ? '#2c2920' : hover ? '#c9a227' : '#3a352a'}`,
        borderRadius: 6,
        padding: '22px 22px 16px',
        background: locked ? '#080808' : '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'border-color 200ms ease',
        minHeight: 200,
      }}
    >
      <p
        style={{
          margin: '0 0 16px',
          fontFamily: '"Playfair Display", Georgia, serif',
          fontSize: 18,
          fontStyle: 'italic',
          color: locked ? '#3d3a30' : '#ddd5c2',
          lineHeight: 1.5,
          flex: 1,
          filter: locked ? 'blur(4px)' : 'none',
          userSelect: locked ? 'none' : 'auto',
        }}
      >
        "{quote.quote_text}"
      </p>

      {locked && (
        <div
          role="note"
          aria-label="Locked quote — unlock the book to reveal"
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            pointerEvents: 'none',
          }}
        >
          <Lock size={22} color="#c9a227" aria-hidden="true" />
          <span style={{ fontSize: 10, letterSpacing: 2, color: '#9a8443', textTransform: 'uppercase' }}>
            Behind the door
          </span>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontSize: 9,
            letterSpacing: 2,
            color: locked ? '#4a463a' : '#7a6c3e',
            textTransform: 'uppercase',
          }}
        >
          No. {quote.code_number} · {quote.chapter_title}
        </span>
        {!locked && (
          <span style={{ display: 'inline-flex', gap: 12 }}>
            <button onClick={onFavorite} aria-label="Save" style={iconBtn}>
              <Star size={15} color={favorited ? '#c9a227' : '#6a6452'} fill={favorited ? '#c9a227' : 'none'} />
            </button>
            <button onClick={onCopy} aria-label="Copy" style={iconBtn}>
              {copied ? <Check size={15} color="#c9a227" /> : <Copy size={15} color="#6a6452" />}
            </button>
            <button onClick={onShare} aria-label="Share" style={iconBtn}>
              <Share2 size={15} color="#6a6452" />
            </button>
          </span>
        )}
      </div>
    </article>
  );
};

const FilterPill = ({
  label,
  active,
  onClick,
  icon,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  icon?: React.ReactNode;
}) => (
  <button
    onClick={onClick}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      padding: '6px 14px',
      borderRadius: 999,
      textTransform: 'none',
      fontSize: 11,
      cursor: 'pointer',
      transition: 'background-color 200ms, color 200ms, border-color 200ms',
      background: active ? '#c9a227' : 'transparent',
      color: active ? '#1c1503' : '#b6ae99',
      border: active ? '1px solid #c9a227' : '1px solid #3a352a',
    }}
  >
    {icon}
    {label}
  </button>
);

const iconBtn: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  padding: 6,
  minWidth: 32,
  minHeight: 32,
  cursor: 'pointer',
  color: 'inherit',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: 4,
};

export default QuoteVaultPage;
