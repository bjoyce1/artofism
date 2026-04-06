import FloatingNav from '@/components/FloatingNav';
import Footer from '@/components/Footer';

const Refund = () => (
  <div className="min-h-screen bg-deep-black">
    <FloatingNav />
    <div className="pt-24 pb-20 px-6">
      <div className="max-w-3xl mx-auto prose-invert">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-8">Refund Policy</h1>
        <div className="space-y-6 text-muted-foreground text-sm leading-relaxed">
          <p><strong className="text-foreground">Effective Date:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground font-semibold">Digital Product</h2>
            <p>The Art of ISM is a digital product that grants immediate access upon purchase. Because access is delivered instantly, all sales are generally considered final.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground font-semibold">When We Grant Refunds</h2>
            <p>We want you to feel confident in your purchase. If you experience a technical issue that prevents you from accessing the content, or if you believe your purchase was made in error, contact us within <strong className="text-foreground">7 days</strong> of purchase and we'll work with you to resolve it — including issuing a full refund if appropriate.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground font-semibold">How to Request a Refund</h2>
            <p>Email <a href="mailto:support@theartofism.com" className="text-primary hover:underline">support@theartofism.com</a> with your account email and a brief description of the issue. We aim to respond within 48 hours.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground font-semibold">Processing</h2>
            <p>Approved refunds are processed through PayPal and typically appear within 5–10 business days depending on your payment provider.</p>
          </section>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export default Refund;
