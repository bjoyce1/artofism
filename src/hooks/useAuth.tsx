import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  hasAccess: boolean;
  accessLoading: boolean;
  signInWithMagicLink: (email: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshAccess: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  const [accessLoading, setAccessLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAccess = useCallback(async (userId: string) => {
    setAccessLoading(true);
    const { data } = await supabase
      .from('entitlements')
      .select('active')
      .eq('user_id', userId)
      .eq('product_slug', 'art-of-ism-full-access')
      .eq('active', true)
      .maybeSingle();
    setHasAccess(!!data);
    setAccessLoading(false);
  }, []);

  useEffect(() => {
    if (!user) {
      setHasAccess(false);
      setAccessLoading(false);
      return;
    }
    checkAccess(user.id);
  }, [user, checkAccess]);

  const refreshAccess = useCallback(async () => {
    if (!user) return;
    await checkAccess(user.id);
  }, [user, checkAccess]);

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + '/library' },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setHasAccess(false);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, hasAccess, accessLoading, signInWithMagicLink, signOut, refreshAccess }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}
