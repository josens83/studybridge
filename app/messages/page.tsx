'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MessageCircle,
  Search,
  Loader2,
  Pin,
  BellOff,
  MoreVertical,
  User,
  Clock,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import {
  getConversations,
  subscribeToConversations,
  toggleMuteConversation,
  togglePinConversation,
  searchMessages,
  getUnreadMessageCount,
} from '@/lib/supabase/chat';
import type { ConversationWithDetails, MessageSearchResult } from '@/types';

export default function MessagesPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MessageSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }

    loadConversations();

    // Subscribe to conversation updates
    const unsubscribe = subscribeToConversations(user.id, (updatedConv) => {
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === updatedConv.id
            ? { ...conv, ...updatedConv }
            : conv
        ).sort((a, b) => {
          // Sort by pinned first, then by last message
          if (a.participants.find(p => p.user_id === user.id)?.is_pinned !==
              b.participants.find(p => p.user_id === user.id)?.is_pinned) {
            return a.participants.find(p => p.user_id === user.id)?.is_pinned ? -1 : 1;
          }
          return new Date(b.last_message_at || 0).getTime() -
                 new Date(a.last_message_at || 0).getTime();
        })
      );
    });

    return () => {
      unsubscribe();
    };
  }, [user, router]);

  const loadConversations = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const data = await getConversations(user.id);

      // Sort by pinned first, then by last message
      const sorted = data.sort((a, b) => {
        const aPinned = a.participants.find(p => p.user_id === user.id)?.is_pinned;
        const bPinned = b.participants.find(p => p.user_id === user.id)?.is_pinned;
        if (aPinned !== bPinned) return aPinned ? -1 : 1;
        return new Date(b.last_message_at || 0).getTime() -
               new Date(a.last_message_at || 0).getTime();
      });

      setConversations(sorted);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!user || !searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setIsSearching(true);
      const results = await searchMessages(user.id, searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching messages:', error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery.trim()) {
        handleSearch();
      } else {
        setSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleMute = async (conversationId: string) => {
    if (!user) return;

    try {
      const isMuted = await toggleMuteConversation(conversationId, user.id);
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                participants: conv.participants.map((p) =>
                  p.user_id === user.id ? { ...p, is_muted: isMuted } : p
                ),
              }
            : conv
        )
      );
    } catch (error) {
      console.error('Error toggling mute:', error);
    }
    setActiveDropdown(null);
  };

  const handlePin = async (conversationId: string) => {
    if (!user) return;

    try {
      const isPinned = await togglePinConversation(conversationId, user.id);
      setConversations((prev) => {
        const updated = prev.map((conv) =>
          conv.id === conversationId
            ? {
                ...conv,
                participants: conv.participants.map((p) =>
                  p.user_id === user.id ? { ...p, is_pinned: isPinned } : p
                ),
              }
            : conv
        );

        // Re-sort after pinning
        return updated.sort((a, b) => {
          const aPinned = a.participants.find(p => p.user_id === user.id)?.is_pinned;
          const bPinned = b.participants.find(p => p.user_id === user.id)?.is_pinned;
          if (aPinned !== bPinned) return aPinned ? -1 : 1;
          return new Date(b.last_message_at || 0).getTime() -
                 new Date(a.last_message_at || 0).getTime();
        });
      });
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
    setActiveDropdown(null);
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">메시지를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">메시지</h1>
          <p className="text-gray-600">튜터와의 대화를 확인하세요</p>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="메시지 검색..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Search Results */}
        {searchQuery && (
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">
                검색 결과 {isSearching && <Loader2 className="inline w-4 h-4 animate-spin ml-2" />}
              </h2>
            </div>
            {searchResults.length === 0 && !isSearching ? (
              <div className="p-8 text-center text-gray-600">
                검색 결과가 없습니다.
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {searchResults.map((result) => (
                  <Link
                    key={result.message_id}
                    href={`/messages/${result.conversation_id}`}
                    className="block p-4 hover:bg-gray-50 transition"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-1">
                          {result.sender_nickname}
                        </p>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {result.content}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {getTimeAgo(new Date(result.created_at))}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Conversations List */}
        {!searchQuery && (
          <div className="bg-white rounded-lg shadow-sm">
            {conversations.length === 0 ? (
              <div className="p-12 text-center">
                <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  아직 대화가 없습니다
                </h3>
                <p className="text-gray-600 mb-6">
                  튜터와 매칭하여 대화를 시작해보세요
                </p>
                <Link
                  href="/tutoring"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  튜터 찾기
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {conversations.map((conv) => {
                  const participant = conv.participants.find(p => p.user_id === user.id);
                  const isPinned = participant?.is_pinned;
                  const isMuted = participant?.is_muted;

                  return (
                    <div
                      key={conv.id}
                      className={`relative hover:bg-gray-50 transition ${
                        isPinned ? 'bg-blue-50' : ''
                      }`}
                    >
                      <Link
                        href={`/messages/${conv.id}`}
                        className="block p-4"
                      >
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            {conv.other_participant ? (
                              <span className="text-blue-600 font-semibold text-lg">
                                {conv.other_participant.nickname[0]}
                              </span>
                            ) : (
                              <User className="w-6 h-6 text-blue-600" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              {isPinned && (
                                <Pin className="w-3 h-3 text-blue-600" />
                              )}
                              <h3 className="font-semibold text-gray-900 truncate">
                                {conv.other_participant?.nickname || conv.title || '대화'}
                              </h3>
                              {conv.other_participant?.role === 'tutor' && (
                                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                                  튜터
                                </span>
                              )}
                              {isMuted && (
                                <BellOff className="w-3 h-3 text-gray-400" />
                              )}
                            </div>
                            <p className="text-sm text-gray-600 truncate">
                              {conv.last_message_preview || '대화를 시작해보세요'}
                            </p>
                          </div>

                          {/* Meta */}
                          <div className="flex flex-col items-end gap-2">
                            {conv.last_message_at && (
                              <span className="text-xs text-gray-400">
                                {getTimeAgo(new Date(conv.last_message_at))}
                              </span>
                            )}
                            {conv.unread_count > 0 && (
                              <span className="px-2 py-1 bg-blue-600 text-white rounded-full text-xs font-semibold min-w-[20px] text-center">
                                {conv.unread_count > 99 ? '99+' : conv.unread_count}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>

                      {/* Dropdown Menu */}
                      <div className="absolute top-4 right-4">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            setActiveDropdown(activeDropdown === conv.id ? null : conv.id);
                          }}
                          className="p-1 hover:bg-gray-200 rounded"
                        >
                          <MoreVertical className="w-4 h-4 text-gray-400" />
                        </button>

                        {activeDropdown === conv.id && (
                          <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handlePin(conv.id);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              <Pin className="w-4 h-4" />
                              {isPinned ? '고정 해제' : '고정'}
                            </button>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                handleMute(conv.id);
                              }}
                              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                            >
                              <BellOff className="w-4 h-4" />
                              {isMuted ? '알림 켜기' : '알림 끄기'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return '방금';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}일 전`;

  // Show date for older messages
  return date.toLocaleDateString('ko-KR', {
    month: 'short',
    day: 'numeric',
  });
}
