import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LockScreen from './LockScreen';
import { Button } from '@/components/ui/button';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, accessStatus, refreshAccess } = useAuth();

  if (loading || accessStatus === 'loading') {
    return (
      <div className="min-h-screen bg-deep-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Signed-in user whose entitlement query failed. Do NOT show the paywall —
  // this may already be a paying reader whose read just errored transiently.
  if (user && accessStatus === 'error') {
    return (
      <div className="min-h-screen bg-deep-black flex items-center justify-center px-6">
        <div className="max-w-md text-center space-y-6">
          <h1 className="font-display text-2xl text-foreground">
            We couldn't verify your access
          </h1>
          <p className="text-muted-foreground">
            This is usually temporary. Please retry — if the problem persists we're here to help.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              onClick={() => refreshAccess()}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-display"
            >
              Retry
            </Button>
            <Button asChild variant="outline" className="border-border text-foreground">
              <a href="mailto:support@theartofism.com?subject=Access%20verification%20problem">
                Contact support
              </a>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            <Link to="/" className="hover:text-primary">Return home</Link>
          </p>
        </div>
      </div>
    );
  }

  if (!user || accessStatus !== 'granted') {
    return <LockScreen />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
