'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import { getUnreadMessageCount, subscribeToConversations } from '@/lib/supabase/chat';

export default function MessageBell() {
  const { user } = useAuthStore();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user) return;

    loadUnreadCount();

    // Subscribe to conversation updates
    const unsubscribe = subscribeToConversations(user.id, () => {
      loadUnreadCount();
    });

    return () => {
      unsubscribe();
    };
  }, [user]);

  const loadUnreadCount = async () => {
    if (!user) return;

    try {
      const count = await getUnreadMessageCount(user.id);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  if (!user) return null;

  return (
    <Link
      href="/messages"
      className="relative p-2 hover:bg-gray-100 rounded-lg transition"
      title="메시지"
    >
      <MessageCircle className="w-5 h-5 text-gray-600" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}
