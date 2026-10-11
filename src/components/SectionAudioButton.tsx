import { Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

const sectionNames: Record<string, string> = {
  hero: 'Introduction to The Art of ISM',
  dedication: 'the Dedication',
  introduction: 'the Introduction',
  'about-mrcap': 'About Mr. CAP',
  acknowledgments: 'the Acknowledgments',
};

const SectionAudioButton = ({ sectionId, fileName, className = '', label = 'Listen' }: Props) => {
  const { currentSection, isPlaying, toggle } = useSectionAudio();
  const active = currentSection === sectionId && isPlaying;

  const audioSrc = supabase.storage.from('audio').getPublicUrl(fileName).data.publicUrl;

  return (
    <Button
      variant="ghost"
      onClick={() => toggle(sectionId, audioSrc)}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-full border px-4 transition-colors duration-200 ${
        active
          ? 'bg-primary/20 border-primary/50 text-primary'
          : 'bg-card/60 border-border hover:border-primary/30 text-muted-foreground hover:text-primary'
      } ${className}`}
      aria-label={`${active ? 'Pause' : 'Listen to'} ${sectionNames[sectionId] ?? sectionId}`}
      aria-pressed={active}
    >
      {active ? <Pause size={14} /> : <Play size={14} />}
      {label && (
        <span className="text-xs font-ui uppercase tracking-[0.1em] font-medium">
          {active ? 'Pause' : label}
        </span>
      )}
    </Button>
  );
};

export default SectionAudioButton;
