import FloatingNav from '@/components/FloatingNav';
import Footer from '@/components/Footer';

const Privacy = () => (
  <div className="min-h-screen bg-deep-black">
    <FloatingNav />
    <div className="pt-24 pb-20 px-6">
      <div className="max-w-3xl mx-auto prose-invert">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground mb-8">Privacy Policy</h1>
        <div className="space-y-6 text-muted-foreground text-sm leading-relaxed">
          <p><strong className="text-foreground">Effective Date:</strong> {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground font-semibold">What We Collect</h2>
            <p>When you create an account or make a purchase, we collect your email address and payment information (processed securely through PayPal). We also collect basic usage data to improve your reading experience, such as reading progress and saved quotes.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground font-semibold">How We Use Your Data</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>To provide and maintain your access to The Art of ISM</li>
              <li>To process payments and verify purchases</li>
              <li>To send account-related emails (confirmation, password reset)</li>
              <li>To track reading progress and save your preferences</li>
              <li>To improve the platform through anonymized analytics</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground font-semibold">Data Storage & Security</h2>
            <p>Your data is stored securely using industry-standard encryption and hosted on secure cloud infrastructure. We do not sell, trade, or share your personal information with third parties.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground font-semibold">Cookies</h2>
            <p>We use essential cookies to maintain your authentication session. No third-party advertising cookies are used.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground font-semibold">Your Rights</h2>
            <p>You may request access to, correction of, or deletion of your personal data at any time by contacting us at <a href="mailto:support@theartofism.com" className="text-primary hover:underline">support@theartofism.com</a>.</p>
          </section>

          <section className="space-y-3">
            <h2 className="font-display text-xl text-foreground font-semibold">Contact</h2>
            <p>For any privacy-related questions, reach us at <a href="mailto:support@theartofism.com" className="text-primary hover:underline">support@theartofism.com</a>.</p>
          </section>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export default Privacy;
