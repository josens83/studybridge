'use client';

import { memo, useState, useCallback, useMemo } from 'react';
import NextImage from 'next/image';
import {
  Check,
  CheckCheck,
  Edit,
  Trash2,
  Reply,
  X,
  Smile,
  FileIcon,
  Download,
  Copy,
  Forward,
} from 'lucide-react';
import { QuickReactions, MessageReactions } from './EmojiPicker';
import LinkPreview, { extractUrls } from './LinkPreview';
import type { MessageWithSender } from '@/types';
import DOMPurify from 'isomorphic-dompurify';

interface MessageItemProps {
  message: MessageWithSender;
  isOwn: boolean;
  showAvatar: boolean;
  showTime: boolean;
  isFirstUnread: boolean;
  currentUserId: string;
  onReply: (message: MessageWithSender) => void;
  onEdit: (message: MessageWithSender) => void;
  onDelete: (messageId: string) => void;
  onCopy: (content: string) => void;
  onForward: (message: MessageWithSender) => void;
  onReaction: (messageId: string, emoji: string) => void;
  onImageClick: (url: string) => void;
}

// XSS 방지를 위한 컨텐츠 새니타이즈
function sanitizeContent(content: string): string {
  return DOMPurify.sanitize(content, { ALLOWED_TAGS: [] });
}

// 메시지 내용 렌더링 (멘션 + 링크)
function renderMessageContent(content: string, isOwn: boolean) {
  const sanitized = sanitizeContent(content);
  const combinedRegex = /(https?:\/\/[^\s<>"\]]+)|(@\S+)/gi;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let keyIndex = 0;

  while ((match = combinedRegex.exec(sanitized)) !== null) {
    if (match.index > lastIndex) {
      parts.push(sanitized.slice(lastIndex, match.index));
    }

    if (match[1]) {
      // URL
      parts.push(
        <a
          key={`link-${keyIndex++}`}
          href={match[1]}
          target="_blank"
          rel="noopener noreferrer"
          className={`underline break-all ${isOwn ? 'text-blue-200' : 'text-blue-600'} hover:opacity-80`}
        >
          {match[1]}
        </a>
      );
    } else if (match[2]) {
      // Mention
      parts.push(
        <span
          key={`mention-${keyIndex++}`}
          className={`font-semibold cursor-pointer hover:underline ${isOwn ? 'text-blue-200' : 'text-blue-500'}`}
        >
          {match[2]}
        </span>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < sanitized.length) {
    parts.push(sanitized.slice(lastIndex));
  }

  return parts.length > 0 ? parts : sanitized;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function MessageItemComponent({
  message,
  isOwn,
  showAvatar,
  showTime,
  isFirstUnread,
  currentUserId,
  onReply,
  onEdit,
  onDelete,
  onCopy,
  onForward,
  onReaction,
  onImageClick,
}: MessageItemProps) {
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');

  const handleStartEdit = useCallback(() => {
    setIsEditing(true);
    setEditText(message.content || '');
  }, [message.content]);

  const handleCancelEdit = useCallback(() => {
    setIsEditing(false);
    setEditText('');
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (editText.trim()) {
      onEdit({ ...message, content: editText.trim() });
    }
    setIsEditing(false);
    setEditText('');
  }, [editText, message, onEdit]);

  const handleReaction = useCallback((emoji: string) => {
    onReaction(message.id, emoji);
    setShowReactionPicker(false);
  }, [message.id, onReaction]);

  const urls = useMemo(() =>
    message.content ? extractUrls(message.content).slice(0, 1) : [],
    [message.content]
  );

  const hasReactions = useMemo(() =>
    message.metadata?.reactions && Object.keys(message.metadata.reactions).length > 0,
    [message.metadata?.reactions]
  );

  return (
    <article
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
      aria-label={`${message.sender.nickname}의 메시지`}
    >
      <div className={`flex gap-2 max-w-[75%] ${isOwn ? 'flex-row-reverse' : ''}`}>
        {/* Avatar */}
        {!isOwn && (
          <div className="w-8 h-8 flex-shrink-0">
            {showAvatar && (
              <div
                className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"
                aria-hidden="true"
              >
                <span className="text-blue-600 font-semibold text-sm">
                  {message.sender.nickname[0]}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Message Content */}
        <div
          className={`relative group ${isOwn ? 'items-end' : 'items-start'}`}
          onClick={() => setShowMobileActions(prev => !prev)}
        >
          {/* Reply Preview */}
          {message.reply_to && (
            <div
              className="text-xs text-gray-500 mb-1 px-3 py-1 bg-gray-100 rounded border-l-2 border-gray-300"
              aria-label={`답장: ${message.reply_to.content?.substring(0, 50)}`}
            >
              {message.reply_to.content?.substring(0, 50)}
              {(message.reply_to.content?.length || 0) > 50 && '...'}
            </div>
          )}

          {/* Deleted Message */}
          {message.is_deleted ? (
            <div
              className="px-4 py-2 bg-gray-200 rounded-2xl text-gray-500 italic"
              role="note"
            >
              삭제된 메시지입니다
            </div>
          ) : (
            <>
              {/* Images */}
              {message.image_urls && message.image_urls.length > 0 && (
                <div className="mb-1 space-y-1">
                  {message.image_urls.map((url, i) => (
                    <button
                      key={i}
                      className="relative max-w-full rounded-lg overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        onImageClick(url);
                      }}
                      aria-label="이미지 확대"
                    >
                      <NextImage
                        src={url}
                        alt={`첨부 이미지 ${i + 1}`}
                        width={400}
                        height={300}
                        className="rounded-lg hover:opacity-90 transition"
                        style={{ maxWidth: '100%', height: 'auto' }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {/* File */}
              {message.file_url && (
                <a
                  href={message.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center gap-3 p-3 rounded-lg border ${
                    isOwn
                      ? 'bg-blue-500 border-blue-400'
                      : 'bg-white border-gray-200'
                  } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  aria-label={`파일 다운로드: ${message.file_name || '파일'}`}
                >
                  <div className={`p-2 rounded ${isOwn ? 'bg-blue-400' : 'bg-gray-100'}`}>
                    <FileIcon className={`w-5 h-5 ${isOwn ? 'text-white' : 'text-gray-600'}`} aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium truncate ${isOwn ? 'text-white' : 'text-gray-900'}`}>
                      {message.file_name || '파일'}
                    </p>
                    {message.file_size && (
                      <p className={`text-xs ${isOwn ? 'text-blue-100' : 'text-gray-500'}`}>
                        {formatFileSize(message.file_size)}
                      </p>
                    )}
                  </div>
                  <Download className={`w-5 h-5 ${isOwn ? 'text-white' : 'text-gray-600'}`} aria-hidden="true" />
                </a>
              )}

              {/* Text */}
              {message.content && (
                <div>
                  <div
                    className={`px-4 py-2 rounded-2xl ${
                      isOwn
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border border-gray-200'
                    }`}
                  >
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveEdit();
                            if (e.key === 'Escape') handleCancelEdit();
                          }}
                          className="flex-1 bg-transparent border-none outline-none text-inherit"
                          autoFocus
                          aria-label="메시지 수정"
                        />
                        <button
                          onClick={handleSaveEdit}
                          className="text-xs font-medium hover:underline"
                          aria-label="저장"
                        >
                          저장
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-xs opacity-70 hover:opacity-100"
                          aria-label="취소"
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap break-words">
                        {renderMessageContent(message.content, isOwn)}
                      </p>
                    )}
                    {message.is_edited && !isEditing && (
                      <span className={`text-xs ${isOwn ? 'text-blue-200' : 'text-gray-400'}`}>
                        (수정됨)
                      </span>
                    )}
                  </div>
                  {/* Link Preview */}
                  {urls.map((url, idx) => (
                    <LinkPreview key={idx} url={url} isOwn={isOwn} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Time and Read Status */}
          {showTime && (
            <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
              <time
                className="text-xs text-gray-400"
                dateTime={message.created_at}
              >
                {formatTime(new Date(message.created_at))}
              </time>
              {isOwn && (
                <span className="text-gray-400" aria-label={message.read_by && message.read_by.length > 1 ? '읽음' : '전송됨'}>
                  {message.read_by && message.read_by.length > 1 ? (
                    <CheckCheck className="w-3 h-3 text-blue-500" aria-hidden="true" />
                  ) : (
                    <Check className="w-3 h-3" aria-hidden="true" />
                  )}
                </span>
              )}
            </div>
          )}

          {/* Reactions */}
          {hasReactions && (
            <MessageReactions
              reactions={message.metadata!.reactions}
              currentUserId={currentUserId}
              onToggle={handleReaction}
            />
          )}

          {/* Actions */}
          {!message.is_deleted && (
            <div
              className={`absolute top-0 ${
                isOwn ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'
              } ${showMobileActions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition px-2`}
            >
              <div className="flex flex-col gap-1">
                {showReactionPicker && (
                  <div className="relative">
                    <QuickReactions onSelect={handleReaction} />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowReactionPicker(false);
                      }}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center"
                      aria-label="반응 닫기"
                    >
                      <X className="w-3 h-3" aria-hidden="true" />
                    </button>
                  </div>
                )}

                <div
                  className="flex items-center gap-1 bg-white shadow-sm rounded-lg border border-gray-200 p-1"
                  role="toolbar"
                  aria-label="메시지 액션"
                >
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowReactionPicker(prev => !prev);
                    }}
                    className="p-1 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="반응"
                    aria-label="이모지 반응"
                  >
                    <Smile className="w-4 h-4 text-gray-600" aria-hidden="true" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onReply(message);
                    }}
                    className="p-1 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="답장"
                    aria-label="답장"
                  >
                    <Reply className="w-4 h-4 text-gray-600" aria-hidden="true" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onForward(message);
                    }}
                    className="p-1 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    title="전달"
                    aria-label="전달"
                  >
                    <Forward className="w-4 h-4 text-gray-600" aria-hidden="true" />
                  </button>
                  {message.content && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCopy(message.content || '');
                      }}
                      className="p-1 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="복사"
                      aria-label="복사"
                    >
                      <Copy className="w-4 h-4 text-gray-600" aria-hidden="true" />
                    </button>
                  )}
                  {isOwn && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartEdit();
                        }}
                        className="p-1 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="수정"
                        aria-label="수정"
                      >
                        <Edit className="w-4 h-4 text-gray-600" aria-hidden="true" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(message.id);
                        }}
                        className="p-1 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        title="삭제"
                        aria-label="삭제"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" aria-hidden="true" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

// React.memo with custom comparison for performance
export const MessageItem = memo(MessageItemComponent, (prevProps, nextProps) => {
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.is_edited === nextProps.message.is_edited &&
    prevProps.message.is_deleted === nextProps.message.is_deleted &&
    prevProps.message.read_by?.length === nextProps.message.read_by?.length &&
    JSON.stringify(prevProps.message.metadata?.reactions) === JSON.stringify(nextProps.message.metadata?.reactions) &&
    prevProps.isOwn === nextProps.isOwn &&
    prevProps.showAvatar === nextProps.showAvatar &&
    prevProps.showTime === nextProps.showTime &&
    prevProps.isFirstUnread === nextProps.isFirstUnread
  );
});
