import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Music } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const CHAPTER_SONGS: Record<number, { file: string; title: string }> = {
  1:  { file: '1. 16 LETTER.wav',                title: '16 Letter' },
  2:  { file: '2. Focus.wav',                     title: 'Focus' },
  3:  { file: '3. International Club Hopper.wav',  title: 'International Club Hopper' },
  4:  { file: '4. How You Feel About It.wav',      title: 'How You Feel About It' },
  5:  { file: '5. Words Of ISM.wav',               title: 'Words of ISM' },
  6:  { file: '6. Let Me Touch It.wav',             title: 'Let Me Touch It' },
  7:  { file: '7. Space Age ISM.wav',               title: 'Space Age ISM' },
  8:  { file: '8. The Realest.wav',                 title: 'The Realest' },
  9:  { file: '9. For Money.wav',                   title: 'For Money' },
  10: { file: '10. Nothing Without It.wav',         title: 'Nothing Without It' },
  11: { file: '11. Capism.wav',                     title: 'Capism' },
};

function formatTime(s: number) {
  if (!isFinite(s)) return '0:00';
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

interface Props {
  chapterNumber: number;
}

const ChapterAudioPlayer = ({ chapterNumber }: Props) => {
  const song = CHAPTER_SONGS[chapterNumber];

  const audioRef = useRef<HTMLAudioElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [muted, setMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  const publicUrl = song
    ? supabase.storage.from('music').getPublicUrl(song.file).data.publicUrl
    : '';

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
    } else {
      audio.play();
    }
    setPlaying(!playing);
  }, [playing]);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.muted = !muted;
    setMuted(!muted);
  }, [muted]);

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    const bar = progressRef.current;
    if (!audio || !bar) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audio.currentTime = pct * duration;
  }, [duration]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => setCurrentTime(audio.currentTime);
    const onMeta = () => { setDuration(audio.duration); setLoading(false); };
    const onEnd = () => setPlaying(false);
    const onCanPlay = () => setLoading(false);

    audio.addEventListener('timeupdate', onTime);
    audio.addEventListener('loadedmetadata', onMeta);
    audio.addEventListener('ended', onEnd);
    audio.addEventListener('canplay', onCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', onTime);
      audio.removeEventListener('loadedmetadata', onMeta);
      audio.removeEventListener('ended', onEnd);
      audio.removeEventListener('canplay', onCanPlay);
    };
  }, []);

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!song) return null;

  return (
    <>
      <audio ref={audioRef} src={publicUrl} preload="metadata" />

      {/* Collapsed mini-toggle */}
      <AnimatePresence>
        {!expanded && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => setExpanded(true)}
            className="fixed bottom-20 sm:bottom-6 left-4 sm:left-6 z-50 flex items-center gap-2 px-4 py-2.5 bg-card/90 backdrop-blur-lg border border-primary/30 rounded-full text-xs uppercase tracking-[0.12em] text-primary hover:border-primary/60 transition-all shadow-lg shadow-black/40"
            style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            <Music size={14} />
            <span className="hidden sm:inline">{song.title}</span>
            <span className="sm:hidden">Play</span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Expanded player */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-20 sm:bottom-6 left-4 right-4 sm:left-6 sm:right-auto sm:w-[420px] z-50 bg-card/95 backdrop-blur-xl border border-border rounded-2xl sm:rounded-xl p-4 shadow-2xl shadow-black/50"
            style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
          >
            {/* Close */}
            <button
              onClick={() => setExpanded(false)}
              className="absolute top-2 right-3 text-muted-foreground hover:text-foreground text-xs uppercase tracking-widest transition-colors"
            >
              ✕
            </button>

            {/* Track info */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                <Music size={18} className="text-primary" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-display text-foreground truncate">{song.title}</p>
                <p className="text-xs text-muted-foreground font-ui">Mr. CAP — Chapter {chapterNumber}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div
              ref={progressRef}
              onClick={handleSeek}
              className="relative w-full h-1.5 bg-border rounded-full cursor-pointer group mb-2"
            >
              <div
                className="absolute inset-y-0 left-0 bg-primary rounded-full transition-[width] duration-100"
                style={{ width: `${progress}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                style={{ left: `calc(${progress}% - 6px)` }}
              />
            </div>

            {/* Time + controls */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground font-ui tabular-nums">{formatTime(currentTime)}</span>

              <div className="flex items-center gap-3">
                <button
                  onClick={toggleMute}
                  className="p-1.5 text-muted-foreground hover:text-foreground transition-colors active:scale-90"
                >
                  {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>

                <button
                  onClick={togglePlay}
                  disabled={loading}
                  className="w-10 h-10 flex items-center justify-center rounded-full bg-primary text-primary-foreground hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 shadow-lg shadow-primary/30"
                >
                  {playing ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
                </button>
              </div>

              <span className="text-[10px] text-muted-foreground font-ui tabular-nums">{formatTime(duration)}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ChapterAudioPlayer;
