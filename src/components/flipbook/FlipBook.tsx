import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'framer-motion';
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import type { FlipPage } from '@/lib/flipbookPages';
import { playPageFlip } from '@/lib/pageFlipSound';
import PageFace from './PageFace';

interface LeafData {
  front: FlipPage;
  back: FlipPage;
  frontNo: number;
  backNo: number;
}

const EASE = [0.6, 0.05, 0.25, 1] as const;
const RENDER_WINDOW = 3;

/** One physical sheet: front face on the right, back face shown once turned. */
function Leaf({
  data, index, total, turned, dragAngle, single, reduced, near,
}: {
  data: LeafData; index: number; total: number; turned: boolean; dragAngle: number | null;
  single: boolean; reduced: boolean; near: boolean;
}) {
  const rot = useMotionValue(turned ? -180 : 0);
  useEffect(() => {
    if (dragAngle !== null) { rot.set(dragAngle); return; }
    const c = animate(rot, turned ? -180 : 0, { duration: reduced ? 0 : 0.95, ease: EASE });
    return () => c.stop();
  }, [turned, dragAngle, reduced, rot]);

  const z = useTransform(rot, (r) => (r < -90 ? index + 1 : total * 2 - index));
  const lift = useTransform(rot, (r) => Math.sin((Math.abs(r) * Math.PI) / 180));
  // Page bends slightly as it lifts — skew + scale gives a convincing curl without WebGL.
  const skew = useTransform(rot, (r) => -Math.sin((Math.abs(r) * Math.PI) / 180) * 2.2 * (r > -90 ? 1 : -1));
  const frontShade = useTransform(lift, (l) => l * 0.55);
  const backShade = useTransform(lift, (l) => l * 0.45);
  const glint = useTransform(rot, (r) => `${40 + (Math.abs(r) / 180) * 60}%`);
  const castShadow = useTransform(lift, (l) => l * 0.5);
  // In single-page mode a turned page lifts away and fades as it leaves the reader's view.
  const fade = useTransform(rot, (r) => (single ? Math.max(0, Math.min(1, (180 + r) / 50)) : 1));

  const isCover = data.front.kind === 'cover';
  const isBackCover = data.back.kind === 'back-cover';

  return (
    <motion.div
      className="flip-leaf absolute top-0 h-full"
      style={{
        left: single ? 0 : '50%',
        width: single ? '100%' : '50%',
        rotateY: rot,
        skewY: skew,
        zIndex: z,
        opacity: fade,
        transformOrigin: 'left center',
        transformStyle: 'preserve-3d',
      }}
    >
      {/* front */}
      <div className={`flip-face flip-face-front ${isCover ? 'flip-face-cover' : ''}`}>
        {near ? <PageFace page={data.front} pageNumber={data.frontNo} side="right" /> : <div className={isCover ? 'flip-cover absolute inset-0' : 'flip-paper absolute inset-0'} />}
        {!isCover && <div className="flip-gutter-right" aria-hidden />}
        <motion.div className="flip-shade-front" style={{ opacity: frontShade }} aria-hidden />
        <motion.div className="flip-glint" style={{ left: glint, opacity: lift }} aria-hidden />
      </div>
      {/* back */}
      <div className={`flip-face flip-face-back ${isBackCover ? 'flip-face-cover' : ''}`}>
        {single ? (
          <div className="flip-paper flip-paper-reverse absolute inset-0" />
        ) : near ? (
          <PageFace page={data.back} pageNumber={data.backNo} side="left" />
        ) : (
          <div className={isBackCover ? 'flip-cover absolute inset-0' : 'flip-paper absolute inset-0'} />
        )}
        {!isBackCover && <div className="flip-gutter-left" aria-hidden />}
        <motion.div className="flip-shade-back" style={{ opacity: backShade }} aria-hidden />
      </div>
      <CastShadow opacity={castShadow} />
    </motion.div>
  );
}

const CastShadow = ({ opacity }: { opacity: MotionValue<number> }) => (
  <motion.div className="flip-cast-shadow" style={{ opacity }} aria-hidden />
);

export default function FlipBook({ pages }: { pages: FlipPage[] }) {
  const reduced = !!useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 360, h: 540, single: true });
  const [turned, setTurned] = useState(0);
  const [drag, setDrag] = useState<{ index: number; angle: number } | null>(null);
  const [muted, setMuted] = useState(() => typeof window !== 'undefined' && localStorage.getItem('flipbook-muted') === '1');
  const dragRef = useRef<{ x: number; t: number; dir: 1 | -1; index: number; moved: boolean } | null>(null);

  // Measure available space and pick spread (two pages) vs single-page mode.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      const single = width < 820;
      const maxH = Math.max(320, height);
      const pageW = Math.min(single ? width * 0.92 : width / 2.2, (maxH * 0.94) / 1.5);
      setSize({ w: Math.floor(pageW), h: Math.floor(pageW * 1.5), single });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const leaves: LeafData[] = useMemo(() => {
    if (size.single) {
      return pages.map((p, i) => ({ front: p, back: { kind: 'blank' }, frontNo: i, backNo: i }));
    }
    const out: LeafData[] = [];
    for (let i = 0; i < pages.length; i += 2) out.push({ front: pages[i], back: pages[i + 1], frontNo: i, backNo: i + 1 });
    return out;
  }, [pages, size.single]);

  // Keep the reader on the same page when switching between single and spread mode.
  const prevSingle = useRef(size.single);
  useEffect(() => {
    if (prevSingle.current === size.single) return;
    setTurned((t) => (size.single ? t * 2 : Math.ceil(t / 2)));
    prevSingle.current = size.single;
  }, [size.single]);

  const N = leaves.length;
  const go = useCallback(
    (dir: 1 | -1) => {
      setTurned((t) => {
        const next = Math.max(0, Math.min(N - (size.single ? 1 : 0), t + dir));
        if (next !== t && !muted) playPageFlip();
        return next;
      });
    },
    [N, muted, size.single],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'PageDown') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); go(-1); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [go]);

  const bookW = size.single ? size.w : size.w * 2;
  const onPointerDown = (e: React.PointerEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const mid = size.single ? rect.left + rect.width * 0.4 : rect.left + rect.width / 2;
    const dir: 1 | -1 = e.clientX >= mid ? 1 : -1;
    if (dir === 1 && turned >= N - (size.single ? 1 : 0)) return;
    if (dir === -1 && turned <= 0) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = { x: e.clientX, t: performance.now(), dir, index: dir === 1 ? turned : turned - 1, moved: false };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 6) d.moved = true;
    if (!d.moved) return;
    const span = size.single ? size.w : size.w * 1.6;
    const p = Math.max(0, Math.min(1, (d.dir === 1 ? -dx : dx) / span));
    setDrag({ index: d.index, angle: d.dir === 1 ? -180 * p : -180 + 180 * p });
  };
  const onPointerUp = (e: React.PointerEvent) => {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d) return;
    if (!d.moved) { setDrag(null); go(d.dir); return; }
    const dx = e.clientX - d.x;
    const v = Math.abs(dx) / Math.max(1, performance.now() - d.t);
    const span = size.single ? size.w : size.w * 1.6;
    const p = (d.dir === 1 ? -dx : dx) / span;
    setDrag(null);
    if (p > 0.3 || (p > 0.08 && v > 0.6)) go(d.dir);
  };

  // Closed book sits centred on its single visible cover.
  const shift = size.single ? 0 : turned === 0 ? -size.w / 2 : turned === N ? size.w / 2 : 0;
  const thicknessL = Math.min(10, turned * 0.35);
  const thicknessR = Math.min(10, (N - turned) * 0.35);
  const lastNo = pages.length - 1;
  const currentPage = size.single ? turned : Math.min(lastNo, turned * 2);

  return (
    <div className="flex h-full w-full flex-col items-center">
      <div ref={stageRef} className="relative flex w-full flex-1 items-center justify-center min-h-0 flip-stage">
        <motion.div
          className="relative select-none touch-pan-y cursor-grab active:cursor-grabbing"
          style={{ width: bookW, height: size.h, perspective: size.w * 4.5 }}
          animate={{ x: shift }}
          transition={{ duration: reduced ? 0 : 0.95, ease: EASE }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => { dragRef.current = null; setDrag(null); }}
          role="region"
          aria-roledescription="flip book"
          aria-label={`The Art of ISM flip book, page ${currentPage} of ${lastNo}. Use arrow keys to turn pages.`}
        >
          <div className="flip-floor-shadow" aria-hidden />
          {!size.single && turned > 0 && (
            <div className="flip-block left-0" style={{ boxShadow: `-${thicknessL}px ${thicknessL * 0.4}px 0 -1px hsl(var(--paper-edge)), -${thicknessL / 2}px 1px 0 -1px hsl(var(--paper-edge))` }} aria-hidden />
          )}
          {turned < N && (
            <div className="flip-block" style={{ left: size.single ? 0 : '50%', boxShadow: `${thicknessR}px ${thicknessR * 0.4}px 0 -1px hsl(var(--paper-edge)), ${thicknessR / 2}px 1px 0 -1px hsl(var(--paper-edge))`, width: size.single ? '100%' : '50%' }} aria-hidden />
          )}
          <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d', ['--pw' as string]: `${size.w}px` }}>
            {leaves.map((leaf, i) => {
              const near = Math.abs(i - turned) <= RENDER_WINDOW;
              if (size.single && i < turned - 1) return null;
              return (
                <Leaf
                  key={`${size.single ? 's' : 'd'}-${i}`}
                  data={leaf}
                  index={i}
                  total={N}
                  turned={i < turned}
                  dragAngle={drag && drag.index === i ? drag.angle : null}
                  single={size.single}
                  reduced={reduced}
                  near={near}
                />
              );
            })}
          </div>
          {!size.single && turned > 0 && turned < N && <div className="flip-spine" aria-hidden />}
        </motion.div>
      </div>

      <div className="flex items-center gap-3 py-4" role="toolbar" aria-label="Flip book controls">
        <button type="button" onClick={() => go(-1)} disabled={turned === 0} aria-label="Previous page" className="reader-control h-11 w-11 inline-flex items-center justify-center rounded-full text-primary disabled:opacity-30 cursor-pointer transition-colors hover:text-gold-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <span className="font-ui text-sm text-muted-foreground tabular-nums min-w-[7.5rem] text-center" aria-live="polite">
          {currentPage === 0 ? 'Cover' : currentPage === lastNo ? 'Back cover' : `Page ${currentPage} of ${lastNo}`}
        </span>
        <button type="button" onClick={() => go(1)} disabled={turned >= N - (size.single ? 1 : 0)} aria-label="Next page" className="reader-control h-11 w-11 inline-flex items-center justify-center rounded-full text-primary disabled:opacity-30 cursor-pointer transition-colors hover:text-gold-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <ChevronRight className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => setMuted((m) => { localStorage.setItem('flipbook-muted', m ? '0' : '1'); return !m; })}
          aria-label={muted ? 'Turn page sounds on' : 'Turn page sounds off'}
          aria-pressed={!muted}
          className="reader-control h-11 w-11 inline-flex items-center justify-center rounded-full text-primary cursor-pointer transition-colors hover:text-gold-bright focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}
