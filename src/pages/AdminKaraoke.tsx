import { useState, useRef, useCallback, useEffect } from 'react';
import { chapters, introduction, dedication } from '@/data/bookContent';
import { supabase } from '@/integrations/supabase/client';
import FloatingNav from '@/components/FloatingNav';

interface WordTimestamp {
  word: string;
  start: number;
  end: number;
}

interface GenerationResult {
  sectionId: string;
  status: 'pending' | 'generating' | 'success' | 'error';
  message?: string;
}

const sections = [
  { id: 'introduction', label: 'Introduction', text: introduction.paragraphs.join('\n\n'), audioFile: '02_introduction.mp3', tsFile: 'introduction_timestamps.json' },
  { id: 'dedication', label: 'Dedication', text: dedication.text.join('\n\n'), audioFile: '01_dedication.mp3', tsFile: 'dedication_timestamps.json' },
  ...chapters.map(ch => ({
    id: `chapter_${String(ch.number).padStart(2, '0')}`,
    label: `Chapter ${ch.number}: ${ch.title}`,
    text: ch.content.join('\n\n'),
    audioFile: `chapter_${String(ch.number).padStart(2, '0')}.mp3`,
    tsFile: `chapter_${String(ch.number).padStart(2, '0')}_timestamps.json`,
  })),
];

/* ─── Manual Timestamp Marker ─── */
const TimestampMarker = ({ section, onDone }: { section: typeof sections[0]; onDone: () => void }) => {
  const words = section.text.split(/\s+/).filter(w => w.length > 0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [timestamps, setTimestamps] = useState<WordTimestamp[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [saving, setSaving] = useState(false);
  const [audioTime, setAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);

  const audioSrc = supabase.storage.from('audio').getPublicUrl(section.audioFile).data.publicUrl;

  useEffect(() => {
    const audio = new Audio(audioSrc);
    audioRef.current = audio;
    audio.addEventListener('loadedmetadata', () => setAudioDuration(audio.duration));
    audio.addEventListener('timeupdate', () => setAudioTime(audio.currentTime));
    audio.addEventListener('ended', () => setIsPlaying(false));
    return () => { audio.pause(); audio.src = ''; };
  }, [audioSrc]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const markWord = useCallback(() => {
    if (!audioRef.current || currentWordIdx >= words.length) return;
    const now = audioRef.current.currentTime;

    setTimestamps(prev => {
      // Set end time of previous word
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1] = { ...updated[updated.length - 1], end: now };
      }
      // Add new word
      updated.push({ word: words[currentWordIdx], start: now, end: now + 0.3 });
      return updated;
    });
    setCurrentWordIdx(prev => prev + 1);
  }, [currentWordIdx, words]);

  const undoLast = () => {
    if (timestamps.length === 0) return;
    setTimestamps(prev => prev.slice(0, -1));
    setCurrentWordIdx(prev => prev - 1);
  };

  const seekTo = (time: number) => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = time;
    setAudioTime(time);
  };

  const saveTimestamps = async () => {
    // Set the last word's end time
    const final = [...timestamps];
    if (final.length > 0 && audioRef.current) {
      final[final.length - 1] = { ...final[final.length - 1], end: audioRef.current.duration || final[final.length - 1].end + 0.5 };
    }

    setSaving(true);
    try {
      const blob = new Blob([JSON.stringify(final, null, 2)], { type: 'application/json' });
      const { error } = await supabase.storage
        .from('audio')
        .upload(section.tsFile, blob, { upsert: true, contentType: 'application/json' });

      if (error) throw error;
      alert(`Saved ${final.length} word timestamps to ${section.tsFile}`);
      onDone();
    } catch (err: any) {
      alert('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const done = currentWordIdx >= words.length;
  const progress = words.length > 0 ? (currentWordIdx / words.length) * 100 : 0;

  // Keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space') { e.preventDefault(); markWord(); }
      if (e.code === 'KeyP') { e.preventDefault(); togglePlay(); }
      if (e.code === 'KeyZ' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); undoLast(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [markWord]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-xl text-foreground">{section.label}</h2>
        <button onClick={onDone} className="text-xs text-muted-foreground hover:text-foreground">← Back</button>
      </div>

      {/* Audio controls */}
      <div className="p-4 bg-card border border-border rounded-sm space-y-3">
        <div className="flex items-center gap-4">
          <button onClick={togglePlay} className="px-4 py-2 bg-primary text-primary-foreground rounded-sm text-sm font-ui uppercase tracking-wider">
            {isPlaying ? 'Pause (P)' : 'Play (P)'}
          </button>
          <span className="text-sm text-muted-foreground font-mono">
            {audioTime.toFixed(2)}s / {audioDuration.toFixed(2)}s
          </span>
        </div>
        {/* Seek bar */}
        <input
          type="range" min={0} max={audioDuration || 1} step={0.01} value={audioTime}
          onChange={e => seekTo(parseFloat(e.target.value))}
          className="w-full accent-primary"
        />
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{currentWordIdx} / {words.length} words marked</span>
          <span>{progress.toFixed(0)}%</span>
        </div>
        <div className="h-1 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Word display */}
      <div className="p-6 bg-card border border-border rounded-sm text-center min-h-[120px] flex flex-col items-center justify-center">
        {done ? (
          <p className="text-green-400 font-display text-2xl">All words marked! ✓</p>
        ) : (
          <>
            <p className="text-muted-foreground text-xs mb-2">Next word:</p>
            <p className="font-display text-4xl text-primary">{words[currentWordIdx]}</p>
            <p className="text-muted-foreground text-xs mt-4">
              {currentWordIdx > 0 && <span className="text-foreground/50">…{words[currentWordIdx - 1]} </span>}
              <span className="text-primary font-bold">{words[currentWordIdx]}</span>
              {currentWordIdx < words.length - 1 && <span className="text-foreground/50"> {words[currentWordIdx + 1]}…</span>}
            </p>
          </>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3">
        <button
          onClick={markWord}
          disabled={done}
          className="flex-1 py-4 bg-primary text-primary-foreground rounded-sm font-ui text-lg uppercase tracking-wider hover:brightness-110 disabled:opacity-50 transition-all active:scale-[0.98]"
        >
          Mark Word (Space)
        </button>
        <button
          onClick={undoLast}
          disabled={timestamps.length === 0}
          className="px-4 py-4 border border-border text-muted-foreground hover:text-foreground rounded-sm font-ui text-sm uppercase tracking-wider disabled:opacity-30 transition-all"
        >
          Undo (⌘Z)
        </button>
      </div>

      {/* Save */}
      {done && (
        <button
          onClick={saveTimestamps}
          disabled={saving}
          className="w-full py-3 bg-green-600 text-white rounded-sm font-ui text-sm uppercase tracking-widest hover:brightness-110 disabled:opacity-50 transition-all"
        >
          {saving ? 'Saving…' : `Save ${timestamps.length} Timestamps`}
        </button>
      )}

      {/* Recent timestamps preview */}
      {timestamps.length > 0 && (
        <div className="max-h-40 overflow-y-auto p-3 bg-card/50 border border-border rounded-sm">
          <p className="text-xs text-muted-foreground mb-2">Last marked:</p>
          <div className="flex flex-wrap gap-1">
            {timestamps.slice(-20).map((t, i) => (
              <span key={i} className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded">
                {t.word} ({t.start.toFixed(2)}s)
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

/* ─── Main Admin Page ─── */
const AdminKaraoke = () => {
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [markingIndex, setMarkingIndex] = useState<number | null>(null);

  const generateOne = async (sectionId: string, text: string): Promise<string> => {
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-karaoke-audio`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({ sectionId, text }),
    });
    if (!res.ok) throw new Error(await res.text());
    const data = await res.json();
    return `${data.totalWords} words, ${data.totalDuration?.toFixed(1)}s`;
  };

  const generateAll = async () => {
    setIsRunning(true);
    const initialResults: GenerationResult[] = sections.map(s => ({ sectionId: s.id, status: 'pending' }));
    setResults(initialResults);
    for (let i = 0; i < sections.length; i++) {
      setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'generating' } : r));
      try {
        const msg = await generateOne(sections[i].id, sections[i].text);
        setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'success', message: msg } : r));
      } catch (err: any) {
        setResults(prev => prev.map((r, idx) => idx === i ? { ...r, status: 'error', message: err.message } : r));
      }
    }
    setIsRunning(false);
  };

  const generateSingle = async (index: number) => {
    const section = sections[index];
    setResults(prev => {
      const copy = [...prev];
      while (copy.length <= index) copy.push({ sectionId: sections[copy.length]?.id || '', status: 'pending' });
      copy[index] = { sectionId: section.id, status: 'generating' };
      return copy;
    });
    try {
      const msg = await generateOne(section.id, section.text);
      setResults(prev => prev.map((r, idx) => idx === index ? { ...r, status: 'success', message: msg } : r));
    } catch (err: any) {
      setResults(prev => prev.map((r, idx) => idx === index ? { ...r, status: 'error', message: err.message } : r));
    }
  };

  if (markingIndex !== null) {
    return (
      <div className="min-h-[100dvh] bg-deep-black">
        <FloatingNav />
        <div className="pt-24 pb-32 px-5 sm:px-6 max-w-3xl mx-auto">
          <TimestampMarker section={sections[markingIndex]} onDone={() => setMarkingIndex(null)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-deep-black">
      <FloatingNav />
      <div className="pt-24 pb-32 px-5 sm:px-6 max-w-3xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Karaoke Audio Manager</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Generate timestamps via ElevenLabs or manually mark word timings against existing audio.
        </p>

        <div className="flex gap-3 mb-8">
          <button
            onClick={generateAll}
            disabled={isRunning}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-sm font-ui text-sm uppercase tracking-widest hover:brightness-110 disabled:opacity-50 transition-all"
          >
            {isRunning ? 'Generating…' : 'Generate All (ElevenLabs)'}
          </button>
        </div>

        <div className="space-y-3">
          {sections.map((section, i) => {
            const result = results[i];
            return (
              <div key={section.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-sm">
                <div className="min-w-0">
                  <p className="text-sm text-foreground font-medium truncate">{section.label}</p>
                  <p className="text-xs text-muted-foreground">{section.id} · {section.text.split(/\s+/).length} words</p>
                  {result?.message && (
                    <p className={`text-xs mt-1 ${result.status === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                      {result.message}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {result?.status === 'generating' && <span className="text-xs text-primary animate-pulse">Generating…</span>}
                  {result?.status === 'success' && <span className="text-xs text-green-400">✓</span>}
                  {result?.status === 'error' && <span className="text-xs text-red-400">✗</span>}
                  <button
                    onClick={() => setMarkingIndex(i)}
                    className="px-3 py-1.5 text-xs font-ui uppercase tracking-wider border border-primary/40 text-primary hover:bg-primary/10 rounded-sm transition-all"
                  >
                    Mark Manually
                  </button>
                  <button
                    onClick={() => generateSingle(i)}
                    disabled={isRunning}
                    className="px-3 py-1.5 text-xs font-ui uppercase tracking-wider border border-border text-muted-foreground hover:text-primary hover:border-primary/40 rounded-sm transition-all disabled:opacity-50"
                  >
                    Generate
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AdminKaraoke;
