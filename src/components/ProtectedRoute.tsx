import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import LockScreen from './LockScreen';

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading, hasAccess, accessLoading } = useAuth();

  if (loading || accessLoading) {
    return (
      <div className="min-h-screen bg-deep-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !hasAccess) {
    return <LockScreen />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
