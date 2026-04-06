import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import FloatingNav from '@/components/FloatingNav';
import { trackEvent } from '@/lib/analytics';

const LockScreen = () => {
  useEffect(() => { trackEvent('chapter_locked_view'); }, []);

  return (
    <div className="min-h-screen bg-deep-black flex items-center justify-center px-6">
      <FloatingNav />
      <div className="max-w-lg text-center space-y-8">
        <div className="w-20 h-20 rounded-full bg-card border border-primary/30 flex items-center justify-center mx-auto">
          <Lock className="w-8 h-8 text-primary" />
        </div>

        <div className="space-y-4">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            Unlock the full system.
          </h1>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto">
            You've reached paid content inside The Art of ISM.
            Get full access to every chapter, every code, and the full interactive reading experience.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 text-base font-display">
            <Link to="/unlock">Get Full Access</Link>
          </Button>
          <Button asChild variant="outline" className="border-border text-foreground hover:border-primary/40 px-8 py-3 text-base font-display">
            <Link to="/auth">Sign In</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LockScreen;
