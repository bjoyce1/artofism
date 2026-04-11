import { Volume2, Pause } from 'lucide-react';
import { useSectionAudio } from '@/hooks/useSectionAudio';

interface Props {
  sectionId: string;
  audioSrc: string;
  className?: string;
}

const SectionAudioButton = ({ sectionId, audioSrc, className = '' }: Props) => {
  const { currentSection, isPlaying, toggle } = useSectionAudio();
  const active = currentSection === sectionId && isPlaying;

  return (
    <button
      onClick={() => toggle(sectionId, audioSrc)}
      className={`inline-flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-300 active:scale-90 ${
        active
          ? 'bg-primary/20 border-primary/50 text-primary'
          : 'bg-card/60 border-border hover:border-primary/30 text-muted-foreground hover:text-primary'
      } ${className}`}
      aria-label={active ? `Pause ${sectionId} audio` : `Play ${sectionId} audio`}
    >
      {active ? <Pause size={14} /> : <Volume2 size={14} />}
    </button>
  );
};

export default SectionAudioButton;
