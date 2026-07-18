import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { trackEvent } from '@/lib/analytics';
import { safeNextFromLocation } from '@/lib/safeNext';
import { supabase } from '@/integrations/supabase/client';
import FloatingNav from '@/components/FloatingNav';
import SEO from '@/components/SEO';
import AnimatedSection from '@/components/AnimatedSection';
import { Button } from '@/components/ui/button';
import { BookOpen, Code2, Quote, Infinity, Smartphone } from 'lucide-react';

const features = [
  { icon: BookOpen, text: 'Full online access' },
  { icon: BookOpen, text: '11 immersive chapters' },
  { icon: Code2, text: 'The Codes hub' },
  { icon: Quote, text: 'Quote Vault' },
  { icon: Smartphone, text: 'Read anywhere' },
  { icon: Infinity, text: 'Lifetime access' },
];

declare global {
  interface Window { paypal?: any }
}

const Unlock = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, hasAccess, loading, refreshAccess } = useAuth();
  const [paypalClientId, setPaypalClientId] = useState('');
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const trackedRef = useRef(false);
  const next = safeNextFromLocation(location.search, '/library');

  useEffect(() => {
    if (!trackedRef.current) {
      trackedRef.current = true;
      trackEvent('unlock_page_view');
    }
  }, []);

  useEffect(() => {
    if (!loading && hasAccess) navigate(next, { replace: true });
  }, [loading, hasAccess, navigate, next]);

  useEffect(() => {
    supabase.functions.invoke('get-config').then(({ data }) => {
      if (data?.paypalClientId) setPaypalClientId(data.paypalClientId);
    });
  }, []);

  useEffect(() => {
    if (!paypalClientId) return;
    if (document.getElementById('paypal-sdk')) { setPaypalLoaded(true); return; }
    const script = document.createElement('script');
    script.id = 'paypal-sdk';
    script.src = `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&currency=USD&intent=capture&enable-funding=card,venmo&disable-funding=credit`;
    script.onload = () => setPaypalLoaded(true);
    script.onerror = () => setError('Could not load the payment provider. Please refresh and try again.');
    document.body.appendChild(script);
  }, [paypalClientId]);

  useEffect(() => {
    if (!paypalLoaded || !window.paypal || !user) return;
    const container = document.getElementById('paypal-button-container');
    if (!container) return;
    container.innerHTML = '';

    window.paypal.Buttons({
      style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay' },
      // Order creation is delegated to a server-side Edge Function so the
      // amount/currency/product cannot be tampered with by the browser.
      createOrder: async () => {
        trackEvent('checkout_start');
        const { data, error: fnError } = await supabase.functions.invoke('create-paypal-order');
        if (fnError || !data?.orderId) {
          throw new Error(fnError?.message || 'Could not start checkout');
        }
        return data.orderId as string;
      },
      onApprove: async (data: any) => {
        setProcessing(true);
        setError('');
        try {
          const { data: result, error: fnError } = await supabase.functions.invoke('verify-paypal', {
            body: { orderId: data.orderID },
          });
          if (fnError) throw fnError;
          if (result?.success) {
            trackEvent('checkout_success');
            await refreshAccess();
            navigate('/unlock/success');
          } else {
            setError(result?.error || 'Payment verification failed. Please contact support.');
          }
        } catch (err: any) {
          setError(err.message || 'Something went wrong.');
        } finally {
          setProcessing(false);
        }
      },
      onCancel: () => setError('Payment was canceled. You can try again anytime.'),
      onError: (err: any) => {
        console.error('PayPal error:', err);
        setError('Payment error. Please try again.');
      },
    }).render('#paypal-button-container');
  }, [paypalLoaded, user, navigate, refreshAccess]);

  return (
    <div className="min-h-screen bg-deep-black">
      <SEO
        title="Unlock The Art of ISM"
        description="Get lifetime access to The Art of ISM — 11 immersive chapters, the Codes hub, and the Quote Vault by Mr. CAP."
        path="/unlock"
      />
      <FloatingNav />

      <div className="pt-24 pb-32 px-6">
        <div className="max-w-3xl mx-auto">
          <AnimatedSection>
            <div className="text-center space-y-6 mb-16">
              <p className="font-ui text-xs uppercase tracking-[0.4em] text-primary">Full Access</p>
              <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-bold text-foreground">
                Unlock The Art of <span className="text-gold-gradient">ISM</span>
              </h1>
              <p className="font-body text-lg text-muted-foreground max-w-lg mx-auto">
                A Code of Thought, Movement, and Mastery
              </p>
              <div className="pt-4 space-y-2">
                <p className="font-display text-xl text-foreground italic">This is not motivation.</p>
                <p className="font-display text-xl text-primary italic">This is a system.</p>
              </div>
              <p className="text-muted-foreground leading-relaxed max-w-md mx-auto pt-4">
                You're not buying a book. You're unlocking a way of thinking, moving, and operating.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={100}>
            <div className="grid sm:grid-cols-2 gap-4 mb-16">
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-3 p-4 bg-card border border-border rounded-sm">
                  <f.icon size={18} className="text-primary shrink-0" />
                  <span className="text-foreground text-sm">{f.text}</span>
                </div>
              ))}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={200}>
            <div className="bg-card border border-primary/30 rounded-sm p-8 sm:p-12 text-center space-y-8">
              <div className="space-y-2">
                <p className="font-ui text-xs uppercase tracking-[0.3em] text-muted-foreground">One-time payment</p>
                <p className="font-display text-5xl font-bold text-foreground">$9.99</p>
                <p className="text-muted-foreground text-sm">Lifetime access • No subscription</p>
              </div>

              {!user ? (
                <div className="space-y-4">
                  <p className="text-muted-foreground text-sm">Sign in first to complete your purchase.</p>
                  <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 font-display text-base">
                    <Link to={`/auth?next=${encodeURIComponent('/unlock')}`}>Sign In to Purchase</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {processing && (
                    <div className="flex items-center justify-center gap-3 text-primary" role="status" aria-live="polite">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm">Verifying payment...</span>
                    </div>
                  )}
                  <div id="paypal-button-container" className="max-w-sm mx-auto" />
                  {error && <p className="text-destructive text-sm" role="alert">{error}</p>}
                </div>
              )}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={300}>
            <div className="text-center mt-12">
              <Link to="/chapter/1" className="text-primary hover:underline font-display text-sm">
                Read the Free Preview →
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </div>
  );
};

export default Unlock;
