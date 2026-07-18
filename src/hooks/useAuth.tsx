import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { setStorageNamespace, mergeGuestIntoUser, NAMESPACED_KEYS } from '@/lib/userStorage';
import { safeNext } from '@/lib/safeNext';

export type AccessStatus = 'loading' | 'granted' | 'denied' | 'error';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  hasAccess: boolean;
  accessLoading: boolean;
  accessStatus: AccessStatus;
  accessError: string | null;
  signInWithMagicLink: (email: string, redirectPath?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshAccess: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessStatus, setAccessStatus] = useState<AccessStatus>('loading');
  const [accessError, setAccessError] = useState<string | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (event === 'SIGNED_IN') {
        // Deferred to keep this listener callback synchronous per Supabase guidance.
        setTimeout(() => {
          import('@/lib/analytics').then(({ trackEvent }) => trackEvent('auth_complete')).catch(() => {});
        }, 0);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Keep local-storage namespace in sync with signed-in identity. On first
  // sign-in we merge any guest-namespace state into the user's namespace so
  // reading progress made pre-login isn't lost.
  useEffect(() => {
    setStorageNamespace(user?.id ?? null);
    if (user?.id) mergeGuestIntoUser(user.id, NAMESPACED_KEYS);
  }, [user?.id]);

  const checkAccess = useCallback(async (userId: string) => {
    setAccessStatus('loading');
    setAccessError(null);
    const { data, error } = await supabase
      .from('entitlements')
      .select('active')
      .eq('user_id', userId)
      .eq('product_slug', 'art-of-ism-full-access')
      .eq('active', true)
      .maybeSingle();
    if (error) {
      setAccessStatus('error');
      setAccessError(error.message ?? 'Unable to verify access');
      return;
    }
    setAccessStatus(data ? 'granted' : 'denied');
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!user) { setAccessStatus('denied'); setAccessError(null); return; }
    checkAccess(user.id);
  }, [user, loading, checkAccess]);

  const refreshAccess = useCallback(async () => {
    if (!user) return;
    await checkAccess(user.id);
  }, [user, checkAccess]);

  const signInWithMagicLink = async (email: string, redirectPath = '/library') => {
    // Defense-in-depth: validate the redirect here too, not just in callers.
    const safe = safeNext(redirectPath, '/library');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + safe },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setAccessStatus('denied');
    setAccessError(null);
    setStorageNamespace(null);
  };

  const hasAccess = accessStatus === 'granted';
  const accessLoading = accessStatus === 'loading';

  return (
    <AuthContext.Provider value={{
      user, session, loading, hasAccess, accessLoading,
      accessStatus, accessError,
      signInWithMagicLink, signOut, refreshAccess,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
