import FloatingNav from '@/components/FloatingNav';
import HeroSection from '@/components/HeroSection';
import AmbientAudioToggle from '@/components/AmbientAudioToggle';
import DedicationSection from '@/components/DedicationSection';
import IntroductionLayout from '@/components/IntroductionLayout';
import TOCGrid from '@/components/TOCGrid';
import QuoteVault from '@/components/QuoteVault';
import AboutAuthorSection from '@/components/AboutAuthorSection';
import AcknowledgmentsSection from '@/components/AcknowledgmentsSection';
import FinalCTA from '@/components/FinalCTA';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-deep-black">
      <FloatingNav />
      <HeroSection />
      <DedicationSection />
      <IntroductionLayout />
      <TOCGrid />
      <QuoteVault />
      <AboutAuthorSection />
      <AcknowledgmentsSection />
      <FinalCTA />
      <Footer />
      <AmbientAudioToggle />
    </div>
  );
};

export default Index;
