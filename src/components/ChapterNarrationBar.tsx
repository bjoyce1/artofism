import { useEffect, useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Mic, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { toast } from '@/hooks/use-toast';

interface Props {
  sectionId: string;
  /** Joined plain text the admin can regenerate from. */
  text: string;
  /** Optional label override (default: "Mr. CAP narrates"). */
  label?: string;
}

interface NarrationRow {
  section_id: string;
  file_path: string;
  updated_at: string;
}

const SPEEDS = [0.85, 1, 1.25, 1.5] as const;

function fmt(s: number) {
  if (!isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

const ChapterNarrationBar = ({ sectionId, text, label = 'Mr. CAP narrates' }: Props) => {
  const { isAdmin } = useIsAdmin();
  const audioRef = useRef<HTMLAudioElement>(null);
  const [row, setRow] = useState<NarrationRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [t, setT] = useState(0);
  const [d, setD] = useState(0);
  const [speedIdx, setSpeedIdx] = useState(1);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('chapter_narration')
      .select('section_id,file_path,updated_at')
      .eq('section_id', sectionId)
      .maybeSingle();
    setRow((data as NarrationRow | null) ?? null);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [sectionId]);

  const publicUrl = row
    ? supabase.storage.from('audio').getPublicUrl(row.file_path).data.publicUrl + `?v=${encodeURIComponent(row.updated_at)}`
    : '';

  const toggle = () => {
    const a = audioRef.current; if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play().then(() => setPlaying(true)).catch(() => {}); }
  };
  const toggleMute = () => {
    const a = audioRef.current; if (!a) return;
    a.muted = !muted; setMuted(!muted);
  };
  const cycleSpeed = () => {
    const next = (speedIdx + 1) % SPEEDS.length;
    setSpeedIdx(next);
    if (audioRef.current) audioRef.current.playbackRate = SPEEDS[next];
  };
  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const a = audioRef.current; if (!a || !d) return;
    const r = e.currentTarget.getBoundingClientRect();
    a.currentTime = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * d;
  };

  const generate = async () => {
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-narration', {
        body: { sectionId, text },
      });
      if (error) throw error;
      toast({ title: 'Narration ready', description: `Generated ${data?.chunks ?? ''} segments.` });
      await load();
    } catch (e: any) {
      toast({ title: 'Generation failed', description: e?.message ?? 'Unknown error', variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return null;

  return (
    <div
      className="sticky top-0 z-40 -mx-5 sm:-mx-6 mb-6 backdrop-blur-md"
      style={{ background: 'rgba(10,10,10,0.92)', borderTop: '1px solid #3a352a', borderBottom: '1px solid #3a352a' }}
    >
      <audio
        ref={audioRef}
        src={publicUrl || undefined}
        preload="metadata"
        onLoadedMetadata={e => setD(e.currentTarget.duration)}
        onTimeUpdate={e => setT(e.currentTarget.currentTime)}
        onEnded={() => setPlaying(false)}
      />
      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-2.5 flex items-center gap-3">
        <Mic size={14} style={{ color: '#c9a227' }} />
        <span className="font-ui text-[10px] uppercase tracking-[0.22em]" style={{ color: '#9a8443' }}>
          {label}
        </span>

        {row ? (
          <>
            <button
              onClick={toggle}
              className="ml-2 w-9 h-9 rounded-full flex items-center justify-center transition active:scale-95"
              style={{ background: '#c9a227', color: '#050505' }}
              aria-label={playing ? 'Pause narration' : 'Play narration'}
            >
              {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
            </button>

            <div className="flex-1 flex items-center gap-2 min-w-0">
              <span className="font-ui text-[10px] tabular-nums" style={{ color: '#9a8443' }}>{fmt(t)}</span>
              <div onClick={seek} className="flex-1 h-1 rounded-full cursor-pointer" style={{ background: '#3a352a' }}>
                <div className="h-full rounded-full" style={{ width: `${d ? (t / d) * 100 : 0}%`, background: '#c9a227' }} />
              </div>
              <span className="font-ui text-[10px] tabular-nums" style={{ color: '#9a8443' }}>{fmt(d)}</span>
            </div>

            <button
              onClick={cycleSpeed}
              className="font-ui text-[10px] uppercase tracking-[0.15em] px-2 py-1 rounded border"
              style={{ color: '#c9a227', borderColor: '#3a352a' }}
              aria-label="Playback speed"
            >
              {SPEEDS[speedIdx]}×
            </button>
            <button onClick={toggleMute} aria-label={muted ? 'Unmute' : 'Mute'} style={{ color: '#9a8443' }}>
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </>
        ) : (
          <span className="ml-1 font-ui text-[11px]" style={{ color: '#9a8443' }}>
            Narration coming soon
          </span>
        )}

        {isAdmin && (
          <button
            onClick={generate}
            disabled={generating}
            className="ml-auto flex items-center gap-1.5 font-ui text-[10px] uppercase tracking-[0.18em] px-2.5 py-1 rounded border disabled:opacity-60"
            style={{ color: '#c9a227', borderColor: '#c9a227' }}
            title={row ? 'Regenerate from current text' : 'Generate narration MP3'}
          >
            {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            {generating ? 'Generating…' : row ? 'Regenerate' : 'Generate'}
          </button>
        )}
      </div>
    </div>
  );
};

export default ChapterNarrationBar;
