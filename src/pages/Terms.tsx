import FloatingNav from '@/components/FloatingNav';
import Footer from '@/components/Footer';

const Terms = () => (
  <div className="min-h-screen bg-deep-black">
    <FloatingNav />
    <div className="pt-24 pb-20 px-6">
      <div className="max-w-3xl mx-auto prose-invert">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-8">Terms of Service</h1>
        <div className="space-y-6 text-muted-foreground text-sm leading-relaxed">
          <p><strong className="text-foreground">Effective Date:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground font-semibold">1. Acceptance</h2>
            <p>By accessing or using The Art of ISM ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Platform.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground font-semibold">2. Account</h2>
            <p>You are responsible for maintaining the security of your account credentials. You must provide accurate information when creating an account.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground font-semibold">3. Digital Product</h2>
            <p>The Art of ISM is a digital product. Upon purchase, you receive a personal, non-transferable, non-exclusive license to access the content for your own private use. You may not redistribute, resell, or share your access with others.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground font-semibold">4. Intellectual Property</h2>
            <p>All content — including text, design, graphics, audio, and code — is the intellectual property of The Art of ISM and its author, Mr. CAP. Unauthorized reproduction is prohibited.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground font-semibold">5. Payment</h2>
            <p>Payments are processed securely through PayPal. All prices are in USD. Your purchase grants lifetime access to the content available at the time of purchase.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground font-semibold">6. Limitation of Liability</h2>
            <p>The Platform is provided "as is." We make no warranties regarding uninterrupted access or error-free operation. Our total liability is limited to the amount you paid for the product.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground font-semibold">7. Changes</h2>
            <p>We reserve the right to update these terms at any time. Continued use of the Platform after changes constitutes acceptance of the updated terms.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground font-semibold">8. Contact</h2>
            <p>Questions about these terms? Contact us at <a href="mailto:support@theartofism.com" className="text-primary hover:underline">support@theartofism.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export default Terms;
