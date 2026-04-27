import QuoteVault from '@/components/QuoteVault';
import FloatingNav from '@/components/FloatingNav';
import SEO from '@/components/SEO';

const QuoteVaultPage = () => {
  return (
    <div className="min-h-screen bg-deep-black">
      <SEO
        title="Quote Vault"
        description="A curated collection of quotes from The Art of ISM by Mr. CAP."
        path="/quote-vault"
        noindex
      />
      <FloatingNav />
      <div className="pt-20">
        <QuoteVault />
      </div>
    </div>
  );
};

export default QuoteVaultPage;
