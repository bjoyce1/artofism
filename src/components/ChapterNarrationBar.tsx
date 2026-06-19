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

interface NarrationJob {
  id: string;
  status: 'queued' | 'generating' | 'completed' | 'failed';
  total_chunks: number;
  completed_chunks: number;
  error_message: string | null;
  file_path: string | null;
  updated_at: string;
  completed_at: string | null;
}

const SPEEDS = [0.85, 1, 1.25, 1.5] as const;

function fmt(s: number) {
  if (!isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

async function getFunctionErrorMessage(error: any) {
  const context = error?.context;
  if (context && typeof context.json === 'function') {
    try {
      const body = await context.json();
      if (body?.error) return body.error;
    } catch {
      // Fall back to the generic message below.
    }
  }
  return error?.message ?? 'Unknown error';
}

const ChapterNarrationBar = ({ sectionId, text, label = 'Mr. CAP narrates' }: Props) => {
  const { isAdmin } = useIsAdmin();
  const audioRef = useRef<HTMLAudioElement>(null);
  const notifiedJobRef = useRef<string | null>(null);
  const trackedJobRef = useRef<string | null>(null);
  const [row, setRow] = useState<NarrationRow | null>(null);
  const [job, setJob] = useState<NarrationJob | null>(null);
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

  const loadJob = async () => {
    if (!isAdmin) return;
    const { data } = await supabase
      .from('narration_generation_jobs')
      .select('id,status,total_chunks,completed_chunks,error_message,file_path,updated_at,completed_at')
      .eq('section_id', sectionId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    setJob((data as NarrationJob | null) ?? null);
  };

  useEffect(() => {
    if (!isAdmin) { setJob(null); return; }
    loadJob();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, sectionId]);

  useEffect(() => {
    if (!job || (job.status !== 'queued' && job.status !== 'generating')) return;
    const timer = window.setInterval(loadJob, 4000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job?.id, job?.status, isAdmin, sectionId]);

  useEffect(() => {
    if (!job || notifiedJobRef.current === job.id) return;
    if (job.status === 'completed') {
      notifiedJobRef.current = job.id;
      if (trackedJobRef.current === job.id) {
        toast({ title: 'Narration ready', description: `Generated ${job.total_chunks} segments.` });
      }
      load();
    }
    if (job.status === 'failed') {
      notifiedJobRef.current = job.id;
      if (trackedJobRef.current === job.id) {
        toast({ title: 'Generation failed', description: job.error_message ?? 'Unknown error', variant: 'destructive' });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [job?.id, job?.status]);

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
      const queuedJob: NarrationJob = {
        id: data.jobId,
        status: 'queued',
        total_chunks: data?.chunks ?? 0,
        completed_chunks: 0,
        error_message: null,
        file_path: null,
        updated_at: new Date().toISOString(),
        completed_at: null,
      };
      notifiedJobRef.current = null;
      trackedJobRef.current = data.jobId;
      setJob(queuedJob);
      toast({ title: 'Narration queued', description: 'Generation will continue in the background.' });
    } catch (e: any) {
      toast({ title: 'Generation failed', description: await getFunctionErrorMessage(e), variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const activeJob = job && (job.status === 'queued' || job.status === 'generating');
  const jobLabel = activeJob
    ? job.status === 'queued'
      ? 'Queued'
      : `Generating ${job.completed_chunks}/${job.total_chunks || '…'}`
    : job?.status === 'failed'
      ? 'Failed'
      : job?.status === 'completed'
        ? 'Complete'
        : null;

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
          <div className="ml-auto flex items-center gap-2">
            {jobLabel && (
              <span className="hidden sm:inline font-ui text-[10px] uppercase tracking-[0.14em]" style={{ color: job?.status === 'failed' ? '#ef4444' : '#9a8443' }}>
                {jobLabel}
              </span>
            )}
            <button
              onClick={generate}
              disabled={generating || !!activeJob}
              className="flex items-center gap-1.5 font-ui text-[10px] uppercase tracking-[0.18em] px-2.5 py-1 rounded border disabled:opacity-60"
              style={{ color: '#c9a227', borderColor: '#c9a227' }}
              title={row ? 'Regenerate from current text' : 'Generate narration MP3'}
            >
              {generating || activeJob ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
              {generating ? 'Queueing…' : activeJob ? 'Working…' : row ? 'Regenerate' : job?.status === 'failed' ? 'Retry' : 'Generate'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChapterNarrationBar;
