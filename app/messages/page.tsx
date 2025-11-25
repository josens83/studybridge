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
  Plus,
  Users,
  X,
  Check,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import {
  getConversations,
  subscribeToConversations,
  toggleMuteConversation,
  togglePinConversation,
  searchMessages,
  getUnreadMessageCount,
  createGroupConversation,
  searchUsers,
} from '@/lib/supabase/chat';
import type { ConversationWithDetails, MessageSearchResult, User as UserType } from '@/types';

export default function MessagesPage() {
  const router = useRouter();
  const { user } = useAuthStore();

  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MessageSearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Group chat creation
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [groupTitle, setGroupTitle] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [userSearchResults, setUserSearchResults] = useState<Partial<UserType>[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<Partial<UserType>[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);

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

  // User search for group creation
  useEffect(() => {
    const debounce = setTimeout(async () => {
      if (userSearchQuery.trim() && user) {
        setIsSearchingUsers(true);
        try {
          const results = await searchUsers(userSearchQuery, user.id);
          setUserSearchResults(results || []);
        } catch (error) {
          console.error('Error searching users:', error);
        } finally {
          setIsSearchingUsers(false);
        }
      } else {
        setUserSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [userSearchQuery, user]);

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

  // Handle user selection for group
  const handleSelectUser = (selectedUser: Partial<UserType>) => {
    if (!selectedUsers.find((u) => u.id === selectedUser.id)) {
      setSelectedUsers([...selectedUsers, selectedUser]);
    }
    setUserSearchQuery('');
    setUserSearchResults([]);
  };

  const handleRemoveUser = (userId: string) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
  };

  // Create group conversation
  const handleCreateGroup = async () => {
    if (!user || !groupTitle.trim() || selectedUsers.length === 0) return;

    setIsCreatingGroup(true);
    try {
      const participantIds = selectedUsers.map((u) => u.id!);
      const conversationId = await createGroupConversation(
        user.id,
        groupTitle.trim(),
        participantIds
      );

      // Reset modal state
      setShowGroupModal(false);
      setGroupTitle('');
      setSelectedUsers([]);
      setUserSearchQuery('');

      // Navigate to new conversation
      router.push(`/messages/${conversationId}`);
    } catch (error) {
      console.error('Error creating group:', error);
      alert('그룹 생성에 실패했습니다.');
    } finally {
      setIsCreatingGroup(false);
    }
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
      {/* Group Creation Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">그룹 채팅 만들기</h2>
              <button
                onClick={() => {
                  setShowGroupModal(false);
                  setGroupTitle('');
                  setSelectedUsers([]);
                  setUserSearchQuery('');
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4">
              {/* Group Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  그룹 이름
                </label>
                <input
                  type="text"
                  value={groupTitle}
                  onChange={(e) => setGroupTitle(e.target.value)}
                  placeholder="그룹 이름을 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Selected Users */}
              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map((u) => (
                    <span
                      key={u.id}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {u.nickname}
                      <button
                        onClick={() => handleRemoveUser(u.id!)}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              {/* User Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  참여자 추가
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    placeholder="닉네임으로 검색..."
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Search Results */}
                {(userSearchResults.length > 0 || isSearchingUsers) && (
                  <div className="mt-2 border border-gray-200 rounded-lg max-h-40 overflow-y-auto">
                    {isSearchingUsers ? (
                      <div className="p-3 text-center text-gray-500">
                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                      </div>
                    ) : (
                      userSearchResults.map((u) => (
                        <button
                          key={u.id}
                          onClick={() => handleSelectUser(u)}
                          disabled={selectedUsers.some((s) => s.id === u.id)}
                          className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center gap-3 disabled:opacity-50"
                        >
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              {u.nickname?.[0]}
                            </span>
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{u.nickname}</p>
                            {u.role === 'tutor' && (
                              <span className="text-xs text-purple-600">튜터</span>
                            )}
                          </div>
                          {selectedUsers.some((s) => s.id === u.id) && (
                            <Check className="w-4 h-4 text-blue-600" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setShowGroupModal(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition"
              >
                취소
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={isCreatingGroup || !groupTitle.trim() || selectedUsers.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isCreatingGroup && <Loader2 className="w-4 h-4 animate-spin" />}
                만들기
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 max-w-3xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">메시지</h1>
            <p className="text-gray-600">튜터와의 대화를 확인하세요</p>
          </div>
          <button
            onClick={() => setShowGroupModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            <Users className="w-5 h-5" />
            그룹 만들기
          </button>
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
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                            conv.type === 'group' ? 'bg-green-100' : 'bg-blue-100'
                          }`}>
                            {conv.type === 'group' ? (
                              <Users className="w-6 h-6 text-green-600" />
                            ) : conv.other_participant ? (
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
                                {conv.type === 'group'
                                  ? conv.title || '그룹 채팅'
                                  : conv.other_participant?.nickname || '대화'}
                              </h3>
                              {conv.type === 'group' && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs font-semibold">
                                  {conv.participants.filter(p => !p.left_at).length}명
                                </span>
                              )}
                              {conv.other_participant?.role === 'tutor' && conv.type !== 'group' && (
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
