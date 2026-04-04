import QuoteVault from '@/components/QuoteVault';
import FloatingNav from '@/components/FloatingNav';

const QuoteVaultPage = () => {
  return (
    <div className="min-h-screen bg-deep-black">
      <FloatingNav />
      <div className="pt-20">
        <QuoteVault />
      </div>
    </div>
  );
};

export default QuoteVaultPage;
