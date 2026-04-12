import AnimatedSection from './AnimatedSection';
import { introduction } from '@/data/bookContent';
import SectionAudioButton from '@/components/SectionAudioButton';
import KaraokeText from '@/components/KaraokeText';
import { useSectionAudio } from '@/hooks/useSectionAudio';

const IntroductionLayout = () => {
  const { currentSection, isPlaying, audioRef } = useSectionAudio();
  const sectionId = 'introduction';
  const isAudioPlaying = currentSection === sectionId && isPlaying;

  const pullQuoteText = "If you don't define your mindset, the world will define it for you.";
  const specialLines = ['International State of Mind.', 'Limitless thought.', 'Limitless ability.', 'Why do I think the way I think?'];

  return (
    <section id="introduction" className="relative py-32 px-6">
      <div className="absolute inset-0 bg-gradient-to-b from-deep-black via-smoke/50 to-deep-black pointer-events-none" />

      <div className="relative max-w-3xl mx-auto">
        <AnimatedSection>
          <p className="font-ui text-xs uppercase tracking-[0.4em] text-primary mb-4">Introduction</p>
          <div className="flex items-center gap-3">
            <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground mb-16">
              Enter the <span className="text-gold-gradient">ISM</span>
            </h2>
            <SectionAudioButton sectionId={sectionId} fileName="02_introduction.mp3" className="-mt-12" />
          </div>
        </AnimatedSection>

        {/* Pull quote */}
        <AnimatedSection delay={200}>
          <blockquote className="border-l-2 border-primary pl-8 my-16">
            <p className="font-display text-2xl sm:text-3xl italic text-primary leading-relaxed">
              "{pullQuoteText}"
            </p>
          </blockquote>
        </AnimatedSection>

        {/* Body text — karaoke when audio plays */}
        {isAudioPlaying ? (
          <KaraokeText
            paragraphs={introduction.paragraphs}
            audioElement={audioRef.current}
            isPlaying={isAudioPlaying}
            timestampsFileName="introduction_timestamps.json"
            isFirstParagraph={(i) => i === 0}
          />
        ) : (
          <div className="space-y-6">
            {introduction.paragraphs.map((p, i) => (
              <AnimatedSection key={i} delay={100 + i * 50}>
                <p
                  className={`text-lg leading-[1.9] text-foreground/90 ${
                    i === 0 ? 'drop-cap' : ''
                  } ${
                    specialLines.includes(p)
                      ? 'font-display text-2xl text-primary font-semibold text-center my-8'
                      : ''
                  } ${
                    p === "It's all ISM."
                      ? 'font-display text-3xl text-gold-gradient font-bold text-center mt-16'
                      : ''
                  }`}
                >
                  {p}
                </p>
              </AnimatedSection>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default IntroductionLayout;
