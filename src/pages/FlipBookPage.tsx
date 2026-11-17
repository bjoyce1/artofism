import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEO from '@/components/SEO';
import FlipBook from '@/components/flipbook/FlipBook';
import { buildFlipPages } from '@/lib/flipbookPages';
import { useAuth } from '@/hooks/useAuth';

const FlipBookPage = () => {
  const { hasAccess, accessLoading } = useAuth();
  const pages = useMemo(() => buildFlipPages(hasAccess), [hasAccess]);

  return (
    <main className="flip-room h-[100dvh] flex flex-col overflow-hidden">
      <SEO title="Flip Book | The Art of ISM" description="Turn the pages of The Art of ISM by Mr. CAP as a realistic flip book." path="/flipbook" />
      <header className="flex items-center justify-between px-4 sm:px-8 pt-4">
        <Link to="/" className="inline-flex items-center gap-2 min-h-11 font-ui text-sm text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <h1 className="font-display text-lg sm:text-xl text-primary">The Art of ISM</h1>
        <span className="hidden sm:block font-ui text-xs text-muted-foreground w-24 text-right">Drag or tap to turn</span>
      </header>
      <div className="flex-1 min-h-0 px-2 sm:px-8">
        {accessLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <FlipBook key={hasAccess ? 'full' : 'preview'} pages={pages} />
        )}
      </div>
    </main>
  );
};

export default FlipBookPage;
