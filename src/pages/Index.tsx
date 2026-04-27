import SEO from '@/components/SEO';
import FloatingNav from '@/components/FloatingNav';
import HeroSection from '@/components/HeroSection';

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
      <SEO
        title="The Art of ISM"
        description="A premium interactive online book by Mr. CAP. 11 immersive chapters, the Codes hub, and the Quote Vault — unlock the art of ISM."
        path="/"
        type="book"
      />
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
      
    </div>
  );
};

export default Index;
