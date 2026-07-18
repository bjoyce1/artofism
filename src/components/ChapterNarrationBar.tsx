import { useState, useRef, useCallback, useEffect } from 'react';
import { Play, Pause, Mic, Volume2, VolumeX } from 'lucide-react';
import { useSectionAudio } from '@/hooks/useSectionAudio';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  chapterNumber: number;
}

const SPEEDS = [1, 1.25, 1.5, 0.75];

function formatTime(s: number) {
  if (!isFinite(s) || s < 0) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

const ChapterNarrationBar = ({ chapterNumber }: Props) => {
  const sectionId = `chapter-${chapterNumber}-narration`;
  const fileName = `chapter_${String(chapterNumber).padStart(2, '0')}.mp3`;
  const audioSrc = supabase.storage.from('audio').getPublicUrl(fileName).data.publicUrl;

  const { currentSection, isPlaying, audioRef, currentTime, duration, toggle } = useSectionAudio();
  const isActive = currentSection === sectionId;
  const playing = isActive && isPlaying;

  const trackRef = useRef<HTMLDivElement>(null);
  const [missing, setMissing] = useState(false);
  const [speedIdx, setSpeedIdx] = useState(0);
  const [muted, setMuted] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(audioSrc, { method: 'HEAD' })
      .then((r) => { if (!cancelled && !r.ok) setMissing(true); })
      .catch(() => { if (!cancelled) setMissing(true); });
    return () => { cancelled = true; };
  }, [audioSrc]);

  useEffect(() => {
    if (isActive && audioRef.current) {
      audioRef.current.playbackRate = SPEEDS[speedIdx];
      audioRef.current.muted = muted;
    }
  }, [isActive, speedIdx, muted, audioRef, playing]);

  const handleToggle = () => toggle(sectionId, audioSrc);

  const seekBy = useCallback((delta: number) => {
    if (!isActive || !audioRef.current || !duration) return;
    const next = Math.max(0, Math.min(duration, audioRef.current.currentTime + delta));
    audioRef.current.currentTime = next;
  }, [isActive, audioRef, duration]);

  const seekToPct = useCallback((pct: number) => {
    if (!isActive || !audioRef.current || !duration) return;
    audioRef.current.currentTime = Math.max(0, Math.min(1, pct)) * duration;
  }, [isActive, audioRef, duration]);

  const handleSeekClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    seekToPct((e.clientX - rect.left) / rect.width);
  }, [seekToPct]);

  const handleSeekKey = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!duration) return;
    switch (e.key) {
      case 'ArrowRight': seekBy(5); e.preventDefault(); break;
      case 'ArrowLeft':  seekBy(-5); e.preventDefault(); break;
      case 'PageUp':     seekBy(30); e.preventDefault(); break;
      case 'PageDown':   seekBy(-30); e.preventDefault(); break;
      case 'Home':       seekToPct(0); e.preventDefault(); break;
      case 'End':        seekToPct(1); e.preventDefault(); break;
    }
  }, [seekBy, seekToPct, duration]);

  const cycleSpeed = () => setSpeedIdx((i) => (i + 1) % SPEEDS.length);

  if (missing) return null;

  const shownTime = isActive ? currentTime : 0;
  const shownDuration = isActive && duration ? duration : 0;
  const progress = shownDuration > 0 ? (shownTime / shownDuration) * 100 : 0;
  const currentSpeed = SPEEDS[speedIdx];

  return (
    <div className="w-full bg-card/80 backdrop-blur-md border-y border-border" role="region" aria-label="Chapter narration">
      <div className="flex items-center gap-3 sm:gap-5 px-3 sm:px-6 py-3">
        <div className="hidden sm:flex items-center gap-2 shrink-0 text-primary">
          <Mic size={14} className="opacity-80" aria-hidden="true" />
          <span className="font-ui text-[11px] uppercase tracking-[0.28em]">
            Mr. Cap Narrates
          </span>
        </div>

        <button
          onClick={handleToggle}
          aria-label={playing ? `Pause narration, chapter ${chapterNumber}` : `Play narration, chapter ${chapterNumber}`}
          aria-pressed={playing}
          className="shrink-0 w-11 h-11 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:brightness-110 active:scale-95 transition shadow-md shadow-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-card"
        >
          {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} className="ml-0.5" aria-hidden="true" />}
        </button>

        <span className="font-ui text-xs text-muted-foreground tabular-nums shrink-0 w-10 text-right" aria-hidden="true">
          {formatTime(shownTime)}
        </span>

        <div
          ref={trackRef}
          onClick={handleSeekClick}
          onKeyDown={handleSeekKey}
          role="slider"
          tabIndex={0}
          aria-label="Seek narration"
          aria-valuemin={0}
          aria-valuemax={Math.max(1, Math.round(shownDuration))}
          aria-valuenow={Math.round(shownTime)}
          aria-valuetext={`${formatTime(shownTime)} of ${formatTime(shownDuration)}`}
          className="relative flex-1 h-2 bg-border rounded-full cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
        >
          <div
            className="absolute inset-y-0 left-0 bg-primary rounded-full transition-[width] duration-100"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity shadow"
            style={{ left: `calc(${progress}% - 6px)` }}
          />
        </div>

        <span className="font-ui text-xs text-muted-foreground tabular-nums shrink-0 w-10" aria-hidden="true">
          {formatTime(shownDuration)}
        </span>

        <button
          onClick={cycleSpeed}
          aria-label={`Playback speed, currently ${currentSpeed} times. Activate to cycle.`}
          className="shrink-0 min-h-11 px-2 py-1 border border-border rounded font-ui text-[11px] uppercase tracking-wider text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {currentSpeed}x
        </button>

        <button
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? 'Unmute narration' : 'Mute narration'}
          aria-pressed={muted}
          className="shrink-0 min-h-11 min-w-11 p-1.5 border border-border rounded text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {muted ? <VolumeX size={14} aria-hidden="true" /> : <Volume2 size={14} aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
};

export default ChapterNarrationBar;

