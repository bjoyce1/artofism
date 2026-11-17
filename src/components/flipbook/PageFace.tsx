import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import type { FlipPage } from '@/lib/flipbookPages';
import cover from '@/assets/art_of_ism_book_3.webp';
import logo from '@/assets/ism-logo.webp';

interface Props {
  page: FlipPage;
  pageNumber: number;
  side: 'left' | 'right';
}

const PageFace = ({ page, pageNumber, side }: Props) => {
  if (page.kind === 'cover') {
    return (
      <div className="flip-cover absolute inset-0">
        <img src={cover} alt="The Art of ISM by Mr. CAP — front cover" className="absolute inset-0 h-full w-full object-cover" draggable={false} />
        <div className="flip-cover-sheen absolute inset-0" aria-hidden />
      </div>
    );
  }

  if (page.kind === 'back-cover') {
    return (
      <div className="flip-cover flip-back-cover absolute inset-0 flex flex-col items-center justify-between text-center p-[9cqw]">
        <div className="absolute inset-[4cqw] border border-primary/50 rounded-[1cqw] pointer-events-none" aria-hidden />
        <div className="absolute inset-[5.5cqw] border border-primary/20 rounded-[0.6cqw] pointer-events-none" aria-hidden />
        <img src={logo} alt="" className="w-[38cqw] mt-[6cqw] opacity-95 drop-shadow-[0_0_2cqw_hsl(var(--gold)/0.35)]" draggable={false} />
        <div className="space-y-[3cqw] px-[2cqw]">
          <p className="font-display italic text-[5.2cqw] leading-snug text-foreground">
            “This is not something you read once.
            <br />
            <span className="text-primary">This is something you live.”</span>
          </p>
          <div className="mx-auto h-px w-[20cqw] bg-primary/60" />
          <p className="font-body text-[3.3cqw] leading-relaxed text-foreground/80">
            A code of thought, movement, and mastery — distilled from decades of observation by a Houston original.
          </p>
        </div>
        <div className="mb-[4cqw] space-y-[1.5cqw]">
          <p className="font-display text-[6cqw] text-primary tracking-wide">It's all ISM.</p>
          <p className="font-ui uppercase text-[2.6cqw] tracking-[0.2em] text-muted-foreground">Mr. CAP</p>
        </div>
      </div>
    );
  }

  if (page.kind === 'endpaper') {
    return <div className="flip-endpaper absolute inset-0" aria-hidden />;
  }

  const folio = (
    <span className={`absolute bottom-[5cqw] font-ui text-[2.6cqw] text-[hsl(var(--ink)/0.5)] ${side === 'left' ? 'left-[9cqw]' : 'right-[9cqw]'}`}>
      {pageNumber}
    </span>
  );

  return (
    <div className="flip-paper absolute inset-0 overflow-hidden">
      {page.kind === 'title' && (
        <div className="flex h-full flex-col items-center justify-center text-center px-[10cqw] gap-[4cqw]">
          <p className="font-ui uppercase tracking-[0.2em] text-[2.6cqw] text-[hsl(var(--ink)/0.6)]">Mr. CAP</p>
          <h2 className="font-display text-[10cqw] leading-none text-[hsl(var(--ink))]">The Art of ISM</h2>
          <div className="h-px w-[18cqw] bg-[hsl(var(--crimson))]" />
          <p className="font-body italic text-[3.6cqw] text-[hsl(var(--ink)/0.75)]">A Code of Thought, Movement, and Mastery</p>
        </div>
      )}

      {page.kind === 'chapter-start' && (
        <div className="flex h-full flex-col items-center justify-center text-center px-[10cqw] gap-[3.5cqw]">
          <p className="font-ui uppercase tracking-[0.2em] text-[2.8cqw] text-[hsl(var(--crimson))]">Chapter {page.number}</p>
          <span className="font-display text-[24cqw] leading-none text-[hsl(var(--ink)/0.08)] absolute top-[12cqw]" aria-hidden>
            {String(page.number).padStart(2, '0')}
          </span>
          <h2 className="font-display text-[7.5cqw] leading-tight text-[hsl(var(--ink))] relative">{page.title}</h2>
          <div className="h-px w-[16cqw] bg-[hsl(var(--gold))]" />
          <p className="font-body italic text-[3.6cqw] text-[hsl(var(--ink)/0.7)]">{page.summary}</p>
          {folio}
        </div>
      )}

      {page.kind === 'text' && (
        <div className="h-full px-[9cqw] pt-[8cqw] pb-[10cqw]">
          <p className={`font-ui uppercase tracking-[0.15em] text-[2.2cqw] text-[hsl(var(--ink)/0.45)] truncate mb-[4cqw] ${side === 'left' ? 'text-left' : 'text-right'}`}>
            {page.header}
          </p>
          <div className="font-body text-[3.55cqw] leading-[1.6] text-[hsl(var(--ink)/0.9)] space-y-[2.2cqw]">
            {page.blocks.map((b, i) =>
              b.type === 'h' ? (
                <h3 key={i} className="font-display text-[5.6cqw] leading-tight text-[hsl(var(--ink))] pt-[1cqw] pb-[1cqw] border-b border-[hsl(var(--gold)/0.6)]">
                  {b.text}
                </h3>
              ) : b.type === 'principle' ? (
                <p key={i} className="pl-[3cqw] border-l-2 border-[hsl(var(--crimson)/0.7)] italic whitespace-pre-line">{b.text}</p>
              ) : (
                <p key={i} className="whitespace-pre-line text-justify hyphens-auto">{b.text}</p>
              ),
            )}
          </div>
          {folio}
        </div>
      )}

      {page.kind === 'locked' && (
        <div className="flex h-full flex-col items-center justify-center text-center px-[10cqw] gap-[4cqw]">
          <Lock className="w-[9cqw] h-[9cqw] text-[hsl(var(--gold))]" aria-hidden />
          <h2 className="font-display text-[7cqw] leading-tight text-[hsl(var(--ink))]">The rest of the code awaits</h2>
          <p className="font-body text-[3.6cqw] text-[hsl(var(--ink)/0.75)]">Chapters 2–11, every code, and full narration by Mr. CAP.</p>
          <Link
            to="/unlock"
            onPointerDown={(e) => e.stopPropagation()}
            className="font-display rounded-[1.2cqw] bg-primary text-primary-foreground px-[6cqw] py-[2.8cqw] text-[3.6cqw] hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            Unlock Full Book — $9.99
          </Link>
        </div>
      )}
    </div>
  );
};

export default PageFace;
