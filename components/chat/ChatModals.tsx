'use client';

import { memo, useState, useCallback, useEffect } from 'react';
import NextImage from 'next/image';
import {
  X,
  Users,
  Loader2,
  UserPlus,
  UserMinus,
  Search,
  FileIcon,
} from 'lucide-react';
import {
  getConversations,
  forwardMessage,
  updateGroupConversation,
  getConversationParticipants,
  removeParticipant,
  addConversationParticipants,
  searchUsers,
} from '@/lib/supabase/chat';
import type { MessageWithSender, ConversationWithDetails } from '@/types';

// ===========================================
// Image Lightbox Modal
// ===========================================
interface LightboxModalProps {
  imageUrl: string;
  onClose: () => void;
}

export const LightboxModal = memo(function LightboxModal({ imageUrl, onClose }: LightboxModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="이미지 확대"
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full transition focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="닫기"
      >
        <X className="w-6 h-6" aria-hidden="true" />
      </button>
      <NextImage
        src={imageUrl}
        alt="확대된 이미지"
        width={1200}
        height={800}
        className="max-w-[90vw] max-h-[90vh] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
});

// ===========================================
// Forward Message Modal
// ===========================================
interface ForwardModalProps {
  message: MessageWithSender;
  currentUserId: string;
  currentConversationId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ForwardModal = memo(function ForwardModal({
  message,
  currentUserId,
  currentConversationId,
  onClose,
  onSuccess,
}: ForwardModalProps) {
  const [conversations, setConversations] = useState<ConversationWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isForwarding, setIsForwarding] = useState(false);

  useEffect(() => {
    async function loadConversations() {
      try {
        const convs = await getConversations(currentUserId);
        setConversations(convs.filter(c => c.id !== currentConversationId));
      } catch (error) {
        console.error('Error loading conversations:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadConversations();
  }, [currentUserId, currentConversationId]);

  const handleForward = useCallback(async (targetConversationId: string) => {
    setIsForwarding(true);
    try {
      await forwardMessage(message.id, targetConversationId, currentUserId);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error forwarding message:', error);
      alert('메시지 전달에 실패했습니다.');
    } finally {
      setIsForwarding(false);
    }
  }, [message.id, currentUserId, onSuccess, onClose]);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="forward-modal-title"
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 id="forward-modal-title" className="font-semibold text-lg">
            메시지 전달
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="닫기"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        <div className="p-4 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" aria-hidden="true" />
              <span className="sr-only">로딩 중...</span>
            </div>
          ) : conversations.length === 0 ? (
            <p className="text-gray-500 text-center py-4">전달할 대화방이 없습니다.</p>
          ) : (
            <div className="space-y-2" role="list">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => handleForward(conv.id)}
                  disabled={isForwarding}
                  className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 rounded-lg transition text-left disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  role="listitem"
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    conv.type === 'group' ? 'bg-green-100' : 'bg-blue-100'
                  }`}>
                    {conv.type === 'group' ? (
                      <Users className="w-5 h-5 text-green-600" aria-hidden="true" />
                    ) : (
                      <span className="text-blue-600 font-semibold" aria-hidden="true">
                        {conv.other_participant?.nickname?.[0] || '?'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {conv.type === 'group'
                        ? conv.title || '그룹 채팅'
                        : conv.other_participant?.nickname}
                    </p>
                  </div>
                  {isForwarding && <Loader2 className="w-4 h-4 animate-spin text-blue-600" aria-hidden="true" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// ===========================================
// Group Settings Modal
// ===========================================
interface GroupSettingsModalProps {
  conversationId: string;
  currentTitle: string;
  currentUserId: string;
  onClose: () => void;
  onTitleUpdate: (newTitle: string) => void;
}

export const GroupSettingsModal = memo(function GroupSettingsModal({
  conversationId,
  currentTitle,
  currentUserId,
  onClose,
  onTitleUpdate,
}: GroupSettingsModalProps) {
  const [title, setTitle] = useState(currentTitle);
  const [participants, setParticipants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    async function loadParticipants() {
      try {
        const data = await getConversationParticipants(conversationId);
        setParticipants(data);
      } catch (error) {
        console.error('Error loading participants:', error);
      } finally {
        setIsLoading(false);
      }
    }
    loadParticipants();
  }, [conversationId]);

  const handleUpdateTitle = useCallback(async () => {
    if (!title.trim()) return;
    try {
      await updateGroupConversation(conversationId, { title: title.trim() });
      onTitleUpdate(title.trim());
      alert('그룹명이 변경되었습니다.');
    } catch (error) {
      console.error('Error updating title:', error);
      alert('그룹명 변경에 실패했습니다.');
    }
  }, [conversationId, title, onTitleUpdate]);

  const handleSearch = useCallback(async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const results = await searchUsers(query, currentUserId);
      const existingIds = participants.map(p => p.user_id);
      setSearchResults(results.filter(r => !existingIds.includes(r.id)));
    } catch (error) {
      console.error('Error searching users:', error);
    }
  }, [currentUserId, participants]);

  const handleAddParticipant = useCallback(async (userId: string) => {
    try {
      await addConversationParticipants(conversationId, [userId]);
      const updated = await getConversationParticipants(conversationId);
      setParticipants(updated);
      setSearchQuery('');
      setSearchResults([]);
      setShowAddParticipant(false);
    } catch (error) {
      console.error('Error adding participant:', error);
      alert('참여자 추가에 실패했습니다.');
    }
  }, [conversationId]);

  const handleRemoveParticipant = useCallback(async (userId: string) => {
    if (!confirm('이 참여자를 그룹에서 제거하시겠습니까?')) return;
    try {
      await removeParticipant(conversationId, userId);
      setParticipants(prev => prev.filter(p => p.user_id !== userId));
    } catch (error) {
      console.error('Error removing participant:', error);
      alert('참여자 제거에 실패했습니다.');
    }
  }, [conversationId]);

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="group-settings-title"
    >
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 id="group-settings-title" className="font-semibold text-lg">
            그룹 설정
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="닫기"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>
        <div className="p-4 space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="group-title" className="block text-sm font-medium text-gray-700 mb-1">
              그룹명
            </label>
            <div className="flex gap-2">
              <input
                id="group-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="그룹명을 입력하세요"
              />
              <button
                onClick={handleUpdateTitle}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                변경
              </button>
            </div>
          </div>

          {/* Participants */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                참여자 ({participants.length}명)
              </span>
              <button
                onClick={() => setShowAddParticipant(!showAddParticipant)}
                className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1 focus:outline-none focus:underline"
              >
                <UserPlus className="w-4 h-4" aria-hidden="true" />
                추가
              </button>
            </div>

            {/* Add Participant Search */}
            {showAddParticipant && (
              <div className="mb-3">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="사용자 검색..."
                    aria-label="사용자 검색"
                  />
                </div>
                {searchResults.length > 0 && (
                  <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden" role="listbox">
                    {searchResults.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleAddParticipant(user.id)}
                        className="w-full p-2 flex items-center gap-2 hover:bg-gray-50 text-left focus:outline-none focus:bg-gray-50"
                        role="option"
                      >
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-semibold text-sm">
                            {user.nickname[0]}
                          </span>
                        </div>
                        <span className="text-sm">{user.nickname}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Participant List */}
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-blue-600" aria-hidden="true" />
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto" role="list">
                {participants.map((participant) => (
                  <div
                    key={participant.user_id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                    role="listitem"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {participant.user?.nickname?.[0] || '?'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{participant.user?.nickname}</p>
                      <p className="text-xs text-gray-500">
                        {participant.role === 'admin' ? '관리자' : '멤버'}
                      </p>
                    </div>
                    {participant.user_id !== currentUserId && participant.role !== 'admin' && (
                      <button
                        onClick={() => handleRemoveParticipant(participant.user_id)}
                        className="p-1 text-red-500 hover:bg-red-50 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                        title="제거"
                        aria-label={`${participant.user?.nickname} 제거`}
                      >
                        <UserMinus className="w-4 h-4" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

// ===========================================
// Drag Overlay
// ===========================================
interface DragOverlayProps {
  isDragging: boolean;
}

export const DragOverlay = memo(function DragOverlay({ isDragging }: DragOverlayProps) {
  if (!isDragging) return null;

  return (
    <div
      className="absolute inset-0 bg-blue-500/20 z-50 flex items-center justify-center border-4 border-dashed border-blue-500 rounded-lg m-4"
      role="status"
      aria-live="polite"
    >
      <div className="bg-white px-8 py-6 rounded-xl shadow-lg text-center">
        <FileIcon className="w-12 h-12 text-blue-500 mx-auto mb-3" aria-hidden="true" />
        <p className="text-lg font-semibold text-gray-700">파일을 여기에 놓으세요</p>
        <p className="text-sm text-gray-500 mt-1">이미지 또는 파일을 드롭하여 첨부</p>
      </div>
    </div>
  );
});
