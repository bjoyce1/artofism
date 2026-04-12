import { useState } from 'react';
import { chapters, introduction, dedication } from '@/data/bookContent';
import FloatingNav from '@/components/FloatingNav';

interface GenerationResult {
  sectionId: string;
  status: 'pending' | 'generating' | 'success' | 'error';
  message?: string;
}

const AdminKaraoke = () => {
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const sections = [
    { id: 'introduction', label: 'Introduction', text: introduction.paragraphs.join('\n\n') },
    { id: 'dedication', label: 'Dedication', text: dedication.text.join('\n\n') },
    ...chapters.map(ch => ({
      id: `chapter_${String(ch.number).padStart(2, '0')}`,
      label: `Chapter ${ch.number}: ${ch.title}`,
      text: ch.content.join('\n\n'),
    })),
  ];

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

    if (!res.ok) {
      const err = await res.text();
      throw new Error(err);
    }

    const data = await res.json();
    return `${data.totalWords} words, ${data.totalDuration?.toFixed(1)}s`;
  };

  const generateAll = async () => {
    setIsRunning(true);
    const initialResults: GenerationResult[] = sections.map(s => ({
      sectionId: s.id,
      status: 'pending',
    }));
    setResults(initialResults);

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      setResults(prev => prev.map((r, idx) =>
        idx === i ? { ...r, status: 'generating' } : r
      ));

      try {
        const msg = await generateOne(section.id, section.text);
        setResults(prev => prev.map((r, idx) =>
          idx === i ? { ...r, status: 'success', message: msg } : r
        ));
      } catch (err: any) {
        setResults(prev => prev.map((r, idx) =>
          idx === i ? { ...r, status: 'error', message: err.message } : r
        ));
      }
    }

    setIsRunning(false);
  };

  const generateSingle = async (index: number) => {
    const section = sections[index];
    setResults(prev => {
      const copy = [...prev];
      if (copy.length <= index) {
        while (copy.length <= index) copy.push({ sectionId: sections[copy.length]?.id || '', status: 'pending' });
      }
      copy[index] = { sectionId: section.id, status: 'generating' };
      return copy;
    });

    try {
      const msg = await generateOne(section.id, section.text);
      setResults(prev => prev.map((r, idx) =>
        idx === index ? { ...r, status: 'success', message: msg } : r
      ));
    } catch (err: any) {
      setResults(prev => prev.map((r, idx) =>
        idx === index ? { ...r, status: 'error', message: err.message } : r
      ));
    }
  };

  return (
    <div className="min-h-[100dvh] bg-deep-black">
      <FloatingNav />
      <div className="pt-24 pb-32 px-5 sm:px-6 max-w-3xl mx-auto">
        <h1 className="font-display text-3xl font-bold text-foreground mb-2">Karaoke Audio Generator</h1>
        <p className="text-muted-foreground text-sm mb-8">
          Generate synchronized audio + word timestamps for each section using ElevenLabs.
        </p>

        <button
          onClick={generateAll}
          disabled={isRunning}
          className="mb-8 px-6 py-3 bg-primary text-primary-foreground rounded-sm font-ui text-sm uppercase tracking-widest hover:brightness-110 disabled:opacity-50 transition-all"
        >
          {isRunning ? 'Generating…' : 'Generate All Sections'}
        </button>

        <div className="space-y-3">
          {sections.map((section, i) => {
            const result = results[i];
            return (
              <div
                key={section.id}
                className="flex items-center justify-between p-4 bg-card border border-border rounded-sm"
              >
                <div className="min-w-0">
                  <p className="text-sm text-foreground font-medium truncate">{section.label}</p>
                  <p className="text-xs text-muted-foreground">{section.id} · {section.text.length} chars</p>
                  {result?.message && (
                    <p className={`text-xs mt-1 ${result.status === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                      {result.message}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {result?.status === 'generating' && (
                    <span className="text-xs text-primary animate-pulse">Generating…</span>
                  )}
                  {result?.status === 'success' && (
                    <span className="text-xs text-green-400">✓</span>
                  )}
                  {result?.status === 'error' && (
                    <span className="text-xs text-red-400">✗</span>
                  )}
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
