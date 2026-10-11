import AnimatedSection from './AnimatedSection';
import SectionAudioButton from './SectionAudioButton';
import AcknowledgmentNames, { mentors, legacy, circle } from './AcknowledgmentNames';
import AlbumDownload from './AlbumDownload';

const AcknowledgmentsSection = () => (
  <section id="acknowledgments" className="relative py-16 md:py-24 px-6 bg-gradient-to-b from-deep-black via-smoke to-deep-black">
    <div className="max-w-3xl mx-auto space-y-12 text-center">
      <AnimatedSection>
        <h1 className="font-display text-3xl sm:text-5xl md:text-6xl text-foreground mb-4">Acknowledgments</h1>
        <p className="font-display text-lg text-primary/80 italic mb-6">No journey is built alone.</p>
        <SectionAudioButton sectionId="acknowledgments" fileName="Acknowledgments.mp3" className="mx-auto mb-6" />
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Everything in this world of ISM was shaped by movement, experience, pressure, perspective, and people. This section honors those who were part of the journey—those who gave game, showed love, stood solid, and left their mark on the path.
        </p>
      </AnimatedSection>
      <AnimatedSection>
        <blockquote className="font-display text-xl sm:text-2xl italic text-primary leading-relaxed">
          "Respect to everyone who played a part in the journey. It's all ISM."
        </blockquote>
      </AnimatedSection>
      {[
        { title: 'Mentors, Influence, and Foundation', names: mentors },
        { title: 'Legacy and In Memory', names: legacy },
        { title: 'The Circle', names: circle },
      ].map(group => (
        <AnimatedSection key={group.title}>
          <h2 className="font-ui text-xs sm:text-sm text-primary/80 mb-5">{group.title}</h2>
          <AcknowledgmentNames names={group.names} />
        </AnimatedSection>
      ))}
      <AnimatedSection>
        <div className="border-y border-primary/20 py-8">
          <p className="font-ui text-xs text-muted-foreground mb-3">And to Me</p>
          <h2 className="font-display text-2xl sm:text-3xl text-primary mb-3">Mr. CAP International</h2>
          <p className="font-ui text-xs sm:text-sm text-muted-foreground leading-relaxed">CAPISM — Cold Ass Pimp International State-of-Mind</p>
        </div>
      </AnimatedSection>
      <AnimatedSection><AlbumDownload /></AnimatedSection>
    </div>
  </section>
);

export default AcknowledgmentsSection;
