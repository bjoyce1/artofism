import SEO from '@/components/SEO';
import FloatingNav from '@/components/FloatingNav';
import Footer from '@/components/Footer';
import AcknowledgmentsSection from '@/components/AcknowledgmentsSection';

const Acknowledgments = () => (
  <div className="min-h-screen bg-deep-black">
    <SEO title="Acknowledgments" description="The mentors, friends, and lasting influences behind The Art of ISM by Mr. CAP. No journey is built alone." path="/acknowledgments" />
    <FloatingNav />
    <main className="pt-16"><AcknowledgmentsSection /></main>
    <Footer />
  </div>
);

export default Acknowledgments;