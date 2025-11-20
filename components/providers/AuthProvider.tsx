'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/store/auth';
import { getCurrentUser } from '@/lib/supabase/auth';
import { getSupabase } from '@/lib/supabase/client';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { setUser } = useAuthStore();

  useEffect(() => {
    // Check active session in background - don't block rendering
    checkUser();

    // Listen for auth changes
    const supabase = getSupabase();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setUser]);

  const checkUser = async () => {
    try {
      console.log('Checking user session in background...');
      const result = await getCurrentUser();
      console.log('User check result:', result);
      if (result) {
        setUser(result.profile);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      const supabase = getSupabase();
      const { data } = await supabase
        .from('users')
        .select()
        .eq('id', userId)
        .single();

      if (data) {
        setUser(data);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  // No loading screen - render immediately
  return <>{children}</>;
}
