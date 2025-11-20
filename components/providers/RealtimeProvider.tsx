'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store/auth';
import { getSupabase } from '@/lib/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export default function RealtimeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuthStore();
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!user) return;

    const supabase = getSupabase();

    // Subscribe to notifications for this user
    const notificationChannel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log('New notification received:', payload);

          // Show browser notification if permission granted
          if ('Notification' in window && Notification.permission === 'granted') {
            const notification = payload.new as any;
            new Notification(notification.title, {
              body: notification.content,
              icon: '/logo.png',
              tag: notification.id,
            });
          }

          // Trigger custom event for notification components to listen to
          window.dispatchEvent(
            new CustomEvent('new-notification', {
              detail: payload.new,
            })
          );
        }
      )
      .subscribe((status) => {
        console.log('Realtime subscription status:', status);
      });

    setChannel(notificationChannel);

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    // Cleanup
    return () => {
      if (notificationChannel) {
        supabase.removeChannel(notificationChannel);
      }
    };
  }, [user]);

  return <>{children}</>;
}
