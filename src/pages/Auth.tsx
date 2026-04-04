import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import FloatingNav from '@/components/FloatingNav';
import AnimatedSection from '@/components/AnimatedSection';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, ArrowRight, Check } from 'lucide-react';

const Auth = () => {
  const { user, loading } = useAuth();
  const { signInWithMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-deep-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/library" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const { error } = await signInWithMagicLink(email);
    setSubmitting(false);
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen bg-deep-black">
      <FloatingNav />
      <div className="flex items-center justify-center min-h-screen px-6">
        <AnimatedSection>
          <div className="max-w-md w-full space-y-8 text-center">
            <div className="space-y-3">
              <p className="font-ui text-xs uppercase tracking-[0.4em] text-primary">Access ISM</p>
              <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">Sign In</h1>
              <p className="text-muted-foreground">Enter your email to receive a magic sign-in link.</p>
            </div>

            {sent ? (
              <div className="bg-card border border-primary/30 rounded-sm p-8 space-y-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-display text-xl text-foreground">Check your email</h2>
                <p className="text-muted-foreground text-sm">
                  We sent a sign-in link to <span className="text-foreground">{email}</span>
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="pl-10 bg-card border-border text-foreground placeholder:text-muted-foreground focus:border-primary"
                  />
                </div>
                {error && <p className="text-destructive text-sm">{error}</p>}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 font-display text-base gap-2"
                >
                  {submitting ? 'Sending...' : 'Send Magic Link'}
                  <ArrowRight size={16} />
                </Button>
              </form>
            )}
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default Auth;
