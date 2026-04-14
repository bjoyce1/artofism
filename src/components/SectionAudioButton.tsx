import { Mic, Pause } from 'lucide-react';
import { useSectionAudio } from '@/hooks/useSectionAudio';
import { supabase } from '@/integrations/supabase/client';

interface Props {
  sectionId: string;
  /** Filename inside the "audio" storage bucket, e.g. "00_hero.mp3" */
  fileName: string;
  className?: string;
  /** Optional text label displayed beside the icon (e.g. "Audiobook") */
  label?: string;
}

const SectionAudioButton = ({ sectionId, fileName, className = '', label }: Props) => {
  const { currentSection, isPlaying, toggle } = useSectionAudio();
  const active = currentSection === sectionId && isPlaying;

  const audioSrc = supabase.storage.from('audio').getPublicUrl(fileName).data.publicUrl;

  return (
    <button
      onClick={() => toggle(sectionId, audioSrc)}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full border transition-all duration-300 active:scale-90 ${
        label ? 'px-3 py-1.5' : 'w-8 h-8'
      } ${
        active
          ? 'bg-primary/20 border-primary/50 text-primary'
          : 'bg-card/60 border-border hover:border-primary/30 text-muted-foreground hover:text-primary'
      } ${className}`}
      aria-label={active ? `Pause ${sectionId} audio` : `Play ${sectionId} audio`}
    >
      {active ? <Pause size={14} /> : <Mic size={14} />}
      {label && (
        <span className="text-[10px] font-ui uppercase tracking-[0.1em] font-medium">
          {active ? 'Pause' : label}
        </span>
      )}
    </button>
  );
};

export default SectionAudioButton;
