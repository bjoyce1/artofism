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

  // Probe the file once to hide the bar if it doesn't exist.
  useEffect(() => {
    let cancelled = false;
    fetch(audioSrc, { method: 'HEAD' })
      .then((r) => { if (!cancelled && !r.ok) setMissing(true); })
      .catch(() => { if (!cancelled) setMissing(true); });
    return () => { cancelled = true; };
  }, [audioSrc]);

  // Apply speed / mute to the live audio element when active.
  useEffect(() => {
    if (isActive && audioRef.current) {
      audioRef.current.playbackRate = SPEEDS[speedIdx];
      audioRef.current.muted = muted;
    }
  }, [isActive, speedIdx, muted, audioRef, playing]);

  const handleToggle = () => toggle(sectionId, audioSrc);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive || !audioRef.current || !trackRef.current || !duration) return;
    const rect = trackRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = pct * duration;
  }, [isActive, audioRef, duration]);

  const cycleSpeed = () => setSpeedIdx((i) => (i + 1) % SPEEDS.length);

  if (missing) return null;

  const shownTime = isActive ? currentTime : 0;
  const shownDuration = isActive && duration ? duration : 0;
  const progress = shownDuration > 0 ? (shownTime / shownDuration) * 100 : 0;

  return (
    <div className="w-full bg-card/80 backdrop-blur-md border-y border-border">
      <div className="flex items-center gap-3 sm:gap-5 px-3 sm:px-6 py-3">
        {/* Label */}
        <div className="hidden sm:flex items-center gap-2 shrink-0 text-primary">
          <Mic size={14} className="opacity-80" />
          <span className="font-ui text-[11px] uppercase tracking-[0.28em]">
            Mr. Cap Narrates
          </span>
        </div>

        {/* Play button */}
        <button
          onClick={handleToggle}
          aria-label={playing ? 'Pause narration' : 'Play narration'}
          className="shrink-0 w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:brightness-110 active:scale-95 transition shadow-md shadow-primary/25"
        >
          {playing ? <Pause size={16} /> : <Play size={16} className="ml-0.5" />}
        </button>

        {/* Time */}
        <span className="font-ui text-xs text-muted-foreground tabular-nums shrink-0 w-10 text-right">
          {formatTime(shownTime)}
        </span>

        {/* Progress */}
        <div
          ref={trackRef}
          onClick={handleSeek}
          className="relative flex-1 h-1 bg-border rounded-full cursor-pointer group"
        >
          <div
            className="absolute inset-y-0 left-0 bg-primary rounded-full transition-[width] duration-100"
            style={{ width: `${progress}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow"
            style={{ left: `calc(${progress}% - 6px)` }}
          />
        </div>

        {/* Duration */}
        <span className="font-ui text-xs text-muted-foreground tabular-nums shrink-0 w-10">
          {formatTime(shownDuration)}
        </span>

        {/* Speed */}
        <button
          onClick={cycleSpeed}
          aria-label="Playback speed"
          className="shrink-0 px-2 py-1 border border-border rounded font-ui text-[11px] uppercase tracking-wider text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors tabular-nums"
        >
          {SPEEDS[speedIdx]}x
        </button>

        {/* Mute */}
        <button
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? 'Unmute' : 'Mute'}
          className="shrink-0 p-1.5 border border-border rounded text-muted-foreground hover:text-primary hover:border-primary/50 transition-colors"
        >
          {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
        </button>
      </div>
    </div>
  );
};

export default ChapterNarrationBar;
