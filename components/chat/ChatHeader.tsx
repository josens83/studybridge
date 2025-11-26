'use client';

import { memo } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  MoreVertical,
  Settings,
  LogOut,
  Users,
} from 'lucide-react';
import type { ConversationWithDetails, UserPresence } from '@/types';

interface ChatHeaderProps {
  conversation: ConversationWithDetails;
  otherUserPresence: UserPresence | null;
  showMenu: boolean;
  onToggleMenu: () => void;
  onOpenGroupSettings: () => void;
  onLeaveConversation: () => void;
}

function ChatHeaderComponent({
  conversation,
  otherUserPresence,
  showMenu,
  onToggleMenu,
  onOpenGroupSettings,
  onLeaveConversation,
}: ChatHeaderProps) {
  const otherUser = conversation.other_participant;
  const isGroup = conversation.type === 'group';
  const participantCount = conversation.participants?.filter(p => !p.left_at).length || 0;

  const getPresenceText = () => {
    if (isGroup) {
      return `${participantCount}명 참여 중`;
    }
    if (otherUserPresence?.status === 'online') {
      return '온라인';
    }
    if (otherUserPresence?.last_seen_at) {
      return `최근 접속: ${getTimeAgo(new Date(otherUserPresence.last_seen_at))}`;
    }
    return '오프라인';
  };

  return (
    <header
      className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 sticky top-0 z-10"
      role="banner"
    >
      <Link
        href="/messages"
        className="p-2 hover:bg-gray-100 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label="메시지 목록으로 돌아가기"
      >
        <ArrowLeft className="w-5 h-5" aria-hidden="true" />
      </Link>

      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative flex-shrink-0">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isGroup ? 'bg-green-100' : 'bg-blue-100'
            }`}
            aria-hidden="true"
          >
            {isGroup ? (
              <Users className="w-5 h-5 text-green-600" />
            ) : (
              <span className="text-blue-600 font-semibold">
                {otherUser?.nickname?.[0] || '?'}
              </span>
            )}
          </div>
          {!isGroup && otherUserPresence?.status === 'online' && (
            <span
              className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"
              aria-label="온라인"
            />
          )}
        </div>

        <div className="min-w-0">
          <h1 className="font-semibold text-gray-900 truncate">
            {isGroup
              ? conversation.title || '그룹 채팅'
              : otherUser?.nickname || '대화'}
          </h1>
          <p className="text-xs text-gray-500 truncate">
            {getPresenceText()}
          </p>
        </div>
      </div>

      {/* Menu */}
      <div className="relative">
        <button
          onClick={onToggleMenu}
          className="p-2 hover:bg-gray-100 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="메뉴 열기"
          aria-expanded={showMenu}
          aria-haspopup="menu"
        >
          <MoreVertical className="w-5 h-5 text-gray-600" aria-hidden="true" />
        </button>

        {showMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={onToggleMenu}
              aria-hidden="true"
            />
            <div
              className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden"
              role="menu"
              aria-orientation="vertical"
            >
              {isGroup && (
                <button
                  onClick={onOpenGroupSettings}
                  className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2 focus:outline-none focus:bg-gray-50"
                  role="menuitem"
                >
                  <Settings className="w-4 h-4" aria-hidden="true" />
                  그룹 설정
                </button>
              )}
              <button
                onClick={onLeaveConversation}
                className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 focus:outline-none focus:bg-red-50"
                role="menuitem"
              >
                <LogOut className="w-4 h-4" aria-hidden="true" />
                대화방 나가기
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return '방금';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;
  return `${Math.floor(seconds / 86400)}일 전`;
}

export const ChatHeader = memo(ChatHeaderComponent);
