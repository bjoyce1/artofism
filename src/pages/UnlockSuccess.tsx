import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import FloatingNav from '@/components/FloatingNav';
import AnimatedSection from '@/components/AnimatedSection';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

const UnlockSuccess = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-deep-black flex items-center justify-center px-6">
      <FloatingNav />
      <AnimatedSection>
        <div className="max-w-lg text-center space-y-8">
          <div className="w-20 h-20 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-primary" />
          </div>

          <div className="space-y-4">
            <p className="font-ui text-xs uppercase tracking-[0.4em] text-primary">Access Granted</p>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-foreground">
              Welcome to <span className="text-gold-gradient">ISM</span>
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Your access is unlocked.<br />
              Start reading where the system begins.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 text-base font-display">
              <Link to="/library">Enter the Library</Link>
            </Button>
            <Button asChild variant="outline" className="border-border text-foreground hover:border-primary/40 px-8 py-3 text-base font-display">
              <Link to="/chapter/2">Continue to Chapter 2</Link>
            </Button>
          </div>
        </div>
      </AnimatedSection>
    </div>
  );
};

export default UnlockSuccess;
