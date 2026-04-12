import AnimatedSection from './AnimatedSection';
import { dedication } from '@/data/bookContent';
import SectionAudioButton from '@/components/SectionAudioButton';
import KaraokeText from '@/components/KaraokeText';
import { useSectionAudio } from '@/hooks/useSectionAudio';

const DedicationSection = () => {
  const { currentSection, isPlaying, audioRef } = useSectionAudio();
  const sectionId = 'dedication';
  const isAudioPlaying = currentSection === sectionId && isPlaying;

  return (
    <section className="relative py-24 px-6">
      <div className="absolute inset-0 bg-gradient-to-b from-deep-black via-smoke/30 to-deep-black pointer-events-none" />

      <div className="relative max-w-2xl mx-auto text-center">
        <AnimatedSection>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mb-8" />
          <p className="font-ui text-xs uppercase tracking-[0.4em] text-primary mb-8">Dedication</p>
          <SectionAudioButton sectionId={sectionId} fileName="01_dedication.mp3" />
        </AnimatedSection>

        {isAudioPlaying ? (
          <KaraokeText
            paragraphs={dedication.text}
            audioElement={audioRef.current}
            isPlaying={isAudioPlaying}
            timestampsFileName="dedication_timestamps.json"
          />
        ) : (
          dedication.text.map((line, i) => (
            <AnimatedSection key={i} delay={100 + i * 100}>
              <p className={`font-display text-lg leading-relaxed text-foreground/80 mb-4 italic ${
                i === dedication.text.length - 1 ? 'not-italic font-semibold text-primary mt-8 text-xl' : ''
              }`}>
                {line}
              </p>
            </AnimatedSection>
          ))
        )}

        <AnimatedSection delay={800}>
          <div className="w-16 h-[1px] bg-gradient-to-r from-transparent via-primary to-transparent mx-auto mt-8" />
        </AnimatedSection>
      </div>
    </section>
  );
};

export default DedicationSection;
