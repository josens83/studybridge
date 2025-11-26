'use client';

import { memo, useState, useRef, useCallback, useEffect } from 'react';
import NextImage from 'next/image';
import {
  Send,
  Image as ImageIcon,
  FileIcon,
  X,
  Reply,
  Loader2,
} from 'lucide-react';
import type { MessageWithSender } from '@/types';

interface MessageInputProps {
  onSend: (params: {
    content: string;
    images: File[];
    file: File | null;
    replyToId?: string;
  }) => Promise<void>;
  onTyping: () => void;
  replyTo: MessageWithSender | null;
  onCancelReply: () => void;
  mentionSuggestions: Array<{ id: string; nickname: string; role?: string }>;
  onMentionSearch: (query: string) => void;
  onMentionSelect: (user: { id: string; nickname: string }) => void;
  disabled?: boolean;
}

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

function MessageInputComponent({
  onSend,
  onTyping,
  replyTo,
  onCancelReply,
  mentionSuggestions,
  onMentionSearch,
  onMentionSelect,
  disabled = false,
}: MessageInputProps) {
  const [messageText, setMessageText] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [mentionStartIndex, setMentionStartIndex] = useState<number | null>(null);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Handle text change with mention detection
  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setMessageText(text);
    onTyping();

    // Detect @ mentions
    const cursorPos = e.target.selectionStart || 0;
    const textBeforeCursor = text.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const afterAt = textBeforeCursor.slice(lastAtIndex + 1);
      if (!afterAt.includes(' ')) {
        setMentionStartIndex(lastAtIndex);
        onMentionSearch(afterAt);
        setShowMentions(afterAt.length > 0);
        return;
      }
    }

    setShowMentions(false);
    setMentionStartIndex(null);
  }, [onTyping, onMentionSearch]);

  // Handle mention selection
  const handleSelectMention = useCallback((user: { id: string; nickname: string }) => {
    if (mentionStartIndex === null) return;

    const beforeMention = messageText.slice(0, mentionStartIndex);
    const mentionQuery = messageText.slice(mentionStartIndex + 1).split(' ')[0];
    const afterMention = messageText.slice(mentionStartIndex + mentionQuery.length + 1);
    const newText = `${beforeMention}@${user.nickname} ${afterMention}`;

    setMessageText(newText);
    setShowMentions(false);
    setMentionStartIndex(null);
    onMentionSelect(user);
    textareaRef.current?.focus();
  }, [mentionStartIndex, messageText, onMentionSelect]);

  // Handle send
  const handleSend = useCallback(async () => {
    if (disabled || isSending || (!messageText.trim() && selectedImages.length === 0 && !selectedFile)) {
      return;
    }

    setIsSending(true);
    try {
      await onSend({
        content: messageText.trim(),
        images: selectedImages,
        file: selectedFile,
        replyToId: replyTo?.id,
      });

      // Clear inputs
      setMessageText('');
      setSelectedImages([]);
      setSelectedFile(null);
      onCancelReply();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('메시지 전송에 실패했습니다.');
    } finally {
      setIsSending(false);
    }
  }, [disabled, isSending, messageText, selectedImages, selectedFile, replyTo, onSend, onCancelReply]);

  // Handle key press
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') {
      if (showMentions) {
        setShowMentions(false);
      } else if (replyTo) {
        onCancelReply();
      }
    }
  }, [handleSend, showMentions, replyTo, onCancelReply]);

  // Handle image selection
  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > MAX_IMAGES) {
      alert(`이미지는 최대 ${MAX_IMAGES}개까지 첨부할 수 있습니다.`);
      return;
    }
    setSelectedImages(prev => [...prev, ...files]);
    e.target.value = ''; // Reset input
  }, [selectedImages.length]);

  // Handle file selection
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      alert('파일 크기는 20MB를 초과할 수 없습니다.');
      return;
    }

    setSelectedFile(file);
    e.target.value = ''; // Reset input
  }, []);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="bg-white border-t border-gray-200">
      {/* Reply Preview */}
      {replyTo && (
        <div
          className="px-4 py-2 bg-gray-100 border-b border-gray-200 flex items-center justify-between"
          role="status"
          aria-label={`${replyTo.sender.nickname}에게 답장`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Reply className="w-4 h-4 text-gray-500 flex-shrink-0" aria-hidden="true" />
            <div className="text-sm min-w-0">
              <span className="font-semibold">{replyTo.sender.nickname}</span>
              <span className="text-gray-500 ml-2 truncate block">
                {replyTo.content?.substring(0, 50)}
                {(replyTo.content?.length || 0) > 50 && '...'}
              </span>
            </div>
          </div>
          <button
            onClick={onCancelReply}
            className="p-1 hover:bg-gray-200 rounded flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="답장 취소"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      )}

      {/* Image Preview */}
      {selectedImages.length > 0 && (
        <div
          className="px-4 py-2 bg-gray-100 border-b border-gray-200"
          role="list"
          aria-label="첨부된 이미지"
        >
          <div className="flex gap-2 overflow-x-auto">
            {selectedImages.map((file, index) => (
              <div key={index} className="relative flex-shrink-0" role="listitem">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                  <NextImage
                    src={URL.createObjectURL(file)}
                    alt={`미리보기 ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <button
                  onClick={() => setSelectedImages(prev => prev.filter((_, i) => i !== index))}
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-red-500"
                  aria-label={`이미지 ${index + 1} 제거`}
                >
                  <X className="w-3 h-3" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Preview */}
      {selectedFile && (
        <div className="px-4 py-2 bg-gray-100 border-b border-gray-200">
          <div
            className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200"
            role="status"
            aria-label={`첨부된 파일: ${selectedFile.name}`}
          >
            <div className="p-2 bg-gray-100 rounded">
              <FileIcon className="w-5 h-5 text-gray-600" aria-hidden="true" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="p-1 hover:bg-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="파일 제거"
            >
              <X className="w-4 h-4 text-gray-600" aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="px-4 py-3">
        <div className="flex items-end gap-2">
          {/* Image Button */}
          <button
            onClick={() => imageInputRef.current?.click()}
            className="p-2 hover:bg-gray-100 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="이미지 첨부"
            aria-label="이미지 첨부"
            disabled={disabled}
          >
            <ImageIcon className="w-5 h-5 text-gray-600" aria-hidden="true" />
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
            aria-hidden="true"
          />

          {/* File Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-gray-100 rounded-lg transition focus:outline-none focus:ring-2 focus:ring-blue-500"
            title="파일 첨부"
            aria-label="파일 첨부"
            disabled={disabled}
          >
            <FileIcon className="w-5 h-5 text-gray-600" aria-hidden="true" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            aria-hidden="true"
          />

          {/* Text Input with Mentions */}
          <div className="flex-1 relative">
            {/* Mention Suggestions */}
            {showMentions && mentionSuggestions.length > 0 && (
              <div
                className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto"
                role="listbox"
                aria-label="멘션 제안"
              >
                {mentionSuggestions.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectMention(user)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-blue-50 text-left transition focus:outline-none focus:bg-blue-50"
                    role="option"
                  >
                    <div
                      className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"
                      aria-hidden="true"
                    >
                      <span className="text-blue-600 font-semibold text-sm">
                        {user.nickname[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">{user.nickname}</p>
                      <p className="text-xs text-gray-500">{user.role || '사용자'}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            <textarea
              ref={textareaRef}
              value={messageText}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="메시지를 입력하세요... (@로 멘션)"
              rows={1}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32"
              disabled={disabled || isSending}
              aria-label="메시지 입력"
              aria-describedby={replyTo ? 'reply-to' : undefined}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={disabled || isSending || (!messageText.trim() && selectedImages.length === 0 && !selectedFile)}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label={isSending ? '전송 중...' : '메시지 전송'}
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="w-5 h-5" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export const MessageInput = memo(MessageInputComponent);
