'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import NextImage from 'next/image';
import {
  ArrowLeft,
  Send,
  Image as ImageIcon,
  MoreVertical,
  Loader2,
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
  ChevronDown,
  LogOut,
  Users,
  Forward,
  Settings,
  UserPlus,
  UserMinus,
  Search,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/auth';
import {
  getConversation,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  updateMessage,
  deleteMessage,
  subscribeToMessages,
  subscribeToTyping,
  subscribeToReadReceipts,
  updatePresence,
  getUserPresence,
  leaveConversation,
  toggleReaction,
  forwardMessage,
  getConversations,
  updateGroupConversation,
  getConversationParticipants,
  removeParticipant,
  addConversationParticipants,
  searchUsers,
} from '@/lib/supabase/chat';
import { uploadFile } from '@/lib/supabase/storage';
import { QuickReactions, MessageReactions } from '@/components/chat/EmojiPicker';
import LinkPreview, { extractUrls, renderTextWithLinks } from '@/components/chat/LinkPreview';
import { uploadImage } from '@/lib/supabase/storage';
import type { ConversationWithDetails, MessageWithSender, UserPresence } from '@/types';
import ErrorBoundary from '@/components/error/ErrorBoundary';
import { logError } from '@/lib/error-logging';

function ChatRoomPageContent() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const conversationId = params.id as string;

  const [conversation, setConversation] = useState<ConversationWithDetails | null>(null);
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [otherUserPresence, setOtherUserPresence] = useState<UserPresence | null>(null);
  const [replyTo, setReplyTo] = useState<MessageWithSender | null>(null);
  const [editingMessage, setEditingMessage] = useState<MessageWithSender | null>(null);
  const [editText, setEditText] = useState('');
  const [activeMessageMenu, setActiveMessageMenu] = useState<string | null>(null);

  // 무한 스크롤 관련
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // 새 메시지 알림 배너
  const [showNewMessageBanner, setShowNewMessageBanner] = useState(false);
  const [newMessageCount, setNewMessageCount] = useState(0);

  // 이미지 라이트박스
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // 파일 첨부
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // 이모지 피커
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // 헤더 메뉴
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);

  // 스크롤 위치 추적
  const [isAtBottom, setIsAtBottom] = useState(true);

  // 이모지 반응 관련
  const [showReactionPicker, setShowReactionPicker] = useState<string | null>(null);

  // 메시지 포워딩
  const [showForwardModal, setShowForwardModal] = useState(false);
  const [forwardingMessage, setForwardingMessage] = useState<MessageWithSender | null>(null);
  const [forwardConversations, setForwardConversations] = useState<any[]>([]);
  const [isForwarding, setIsForwarding] = useState(false);

  // 그룹 관리
  const [showGroupSettings, setShowGroupSettings] = useState(false);
  const [groupParticipants, setGroupParticipants] = useState<any[]>([]);
  const [newGroupTitle, setNewGroupTitle] = useState('');
  const [showAddParticipant, setShowAddParticipant] = useState(false);
  const [participantSearchQuery, setParticipantSearchQuery] = useState('');
  const [participantSearchResults, setParticipantSearchResults] = useState<any[]>([]);

  // 드래그 앤 드롭
  const [isDragging, setIsDragging] = useState(false);

  // 멘션 기능
  const [showMentionSuggestions, setShowMentionSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [mentionSuggestions, setMentionSuggestions] = useState<any[]>([]);
  const [mentionStartIndex, setMentionStartIndex] = useState<number | null>(null);

  // 읽지 않은 메시지 자동 스크롤
  const [firstUnreadMessageId, setFirstUnreadMessageId] = useState<string | null>(null);
  const [showJumpToUnread, setShowJumpToUnread] = useState(false);

  // 모바일 터치 관련
  const [touchedMessageId, setTouchedMessageId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const firstUnreadRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const setTypingRef = useRef<((isTyping: boolean) => void) | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/auth');
      return;
    }

    loadData();

    // Update presence
    updatePresence(user.id, 'online', conversationId);

    // Subscribe to new messages
    const unsubscribeMessages = subscribeToMessages(conversationId, (newMessage) => {
      setMessages((prev) => {
        // Check if message already exists (avoid duplicates)
        if (prev.find((m) => m.id === newMessage.id)) {
          return prev.map((m) => (m.id === newMessage.id ? newMessage : m));
        }
        return [...prev, newMessage];
      });

      // Mark as read if not from current user
      if (newMessage.sender_id !== user.id) {
        markMessagesAsRead(conversationId, user.id);

        // 스크롤이 맨 아래가 아니면 새 메시지 배너 표시
        const container = messagesContainerRef.current;
        if (container) {
          const isBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
          if (!isBottom) {
            setShowNewMessageBanner(true);
            setNewMessageCount((prev) => prev + 1);
          }
        }
      }
    });

    // Subscribe to typing indicators
    const typingSubscription = subscribeToTyping(
      conversationId,
      user.id,
      (users) => {
        setTypingUsers(users.filter((id) => id !== user.id));
      }
    );
    setTypingRef.current = typingSubscription.setTyping;

    // Subscribe to read receipts
    const unsubscribeReads = subscribeToReadReceipts(
      conversationId,
      (messageId, userId) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? { ...m, read_by: [...(m.read_by || []), userId] }
              : m
          )
        );
      }
    );

    return () => {
      unsubscribeMessages();
      typingSubscription.unsubscribe();
      unsubscribeReads();
      updatePresence(user.id, 'online');
    };
  }, [user, conversationId, router]);

  useEffect(() => {
    // 맨 아래에 있을 때만 자동 스크롤
    if (isAtBottom) {
      scrollToBottom();
    }
  }, [messages, isAtBottom]);

  const loadData = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      // Load conversation and messages
      const [convData, messagesData] = await Promise.all([
        getConversation(conversationId),
        getMessages(conversationId, 50),
      ]);

      setConversation(convData);
      setMessages(messagesData);
      setHasMore(messagesData.length >= 50);

      // Find first unread message
      const firstUnread = messagesData.find(
        (msg) => msg.sender_id !== user.id && !(msg.read_by || []).includes(user.id)
      );
      if (firstUnread) {
        setFirstUnreadMessageId(firstUnread.id);
        setShowJumpToUnread(true);
      }

      // Mark messages as read
      await markMessagesAsRead(conversationId, user.id);

      // Get other user's presence
      if (convData?.other_participant) {
        const presence = await getUserPresence(convData.other_participant.id);
        setOtherUserPresence(presence);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 읽지 않은 메시지로 스크롤
  const scrollToFirstUnread = () => {
    if (firstUnreadRef.current) {
      firstUnreadRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    setShowJumpToUnread(false);
  };

  // 모바일 터치 핸들러
  const handleMessageTouch = (messageId: string) => {
    if (touchedMessageId === messageId) {
      setTouchedMessageId(null);
    } else {
      setTouchedMessageId(messageId);
    }
  };

  // 이전 메시지 더 불러오기 (무한 스크롤)
  const loadMoreMessages = useCallback(async () => {
    if (!hasMore || isLoadingMore || messages.length === 0) return;

    try {
      setIsLoadingMore(true);
      const oldestMessage = messages[0];
      const olderMessages = await getMessages(conversationId, 50, oldestMessage.created_at);

      if (olderMessages.length < 50) {
        setHasMore(false);
      }

      if (olderMessages.length > 0) {
        setMessages((prev) => [...olderMessages, ...prev]);
      }
    } catch (error) {
      console.error('Error loading more messages:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [conversationId, hasMore, isLoadingMore, messages]);

  // 스크롤 이벤트 핸들러
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    // 맨 아래인지 확인
    const isBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 100;
    setIsAtBottom(isBottom);

    // 새 메시지 배너 숨기기
    if (isBottom) {
      setShowNewMessageBanner(false);
      setNewMessageCount(0);
    }

    // 맨 위에서 더 불러오기
    if (container.scrollTop < 100 && hasMore && !isLoadingMore) {
      loadMoreMessages();
    }
  }, [hasMore, isLoadingMore, loadMoreMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleTyping = () => {
    if (setTypingRef.current) {
      setTypingRef.current(true);

      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        setTypingRef.current?.(false);
      }, 2000);
    }
  };

  const handleSend = async () => {
    if (!user || (!messageText.trim() && selectedImages.length === 0 && !selectedFile)) return;

    setIsSending(true);

    try {
      // Upload images if any
      let imageUrls: string[] = [];
      if (selectedImages.length > 0) {
        imageUrls = await Promise.all(
          selectedImages.map((file) => uploadImage(file, 'chat-images'))
        );
      }

      // Upload file if any
      let fileUrl: string | undefined;
      let fileName: string | undefined;
      let fileSize: number | undefined;
      if (selectedFile) {
        fileUrl = await uploadFile(selectedFile, 'chat-files');
        fileName = selectedFile.name;
        fileSize = selectedFile.size;
      }

      // Determine message type
      let messageType = 'text';
      if (imageUrls.length > 0) messageType = 'image';
      else if (fileUrl) messageType = 'file';

      // Send message
      await sendMessage({
        conversation_id: conversationId,
        sender_id: user.id,
        content: messageText.trim(),
        message_type: messageType,
        image_urls: imageUrls,
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize,
        reply_to_id: replyTo?.id,
      });

      // Clear input
      setMessageText('');
      setSelectedImages([]);
      setSelectedFile(null);
      setReplyTo(null);

      // Stop typing indicator
      setTypingRef.current?.(false);

      // Scroll to bottom
      setIsAtBottom(true);
      scrollToBottom();
    } catch (error) {
      console.error('Error sending message:', error);
      alert('메시지 전송에 실패했습니다.');
    } finally {
      setIsSending(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 5) {
      alert('이미지는 최대 5개까지 첨부할 수 있습니다.');
      return;
    }
    setSelectedImages([...selectedImages, ...files]);
  };

  const handleEditSave = async () => {
    if (!editingMessage || !editText.trim()) return;

    try {
      await updateMessage(editingMessage.id, editText.trim());
      setMessages((prev) =>
        prev.map((m) =>
          m.id === editingMessage.id
            ? { ...m, content: editText.trim(), is_edited: true }
            : m
        )
      );
      setEditingMessage(null);
      setEditText('');
    } catch (error) {
      console.error('Error updating message:', error);
      alert('메시지 수정에 실패했습니다.');
    }
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm('메시지를 삭제하시겠습니까?')) return;

    try {
      await deleteMessage(messageId);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId ? { ...m, is_deleted: true } : m
        )
      );
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('메시지 삭제에 실패했습니다.');
    }
    setActiveMessageMenu(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Enter to send (without shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    // Escape to clear reply/edit
    if (e.key === 'Escape') {
      if (replyTo) setReplyTo(null);
      if (editingMessage) {
        setEditingMessage(null);
        setEditText('');
      }
      if (showMentionSuggestions) {
        setShowMentionSuggestions(false);
      }
    }
    // Ctrl+Shift+E for emoji picker (future implementation)
  };

  // 글로벌 키보드 단축키
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + / to focus input
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        textareaRef.current?.focus();
      }
      // Escape to close modals
      if (e.key === 'Escape') {
        if (showForwardModal) {
          setShowForwardModal(false);
          setForwardingMessage(null);
        }
        if (showGroupSettings) {
          setShowGroupSettings(false);
        }
        if (lightboxImage) {
          setLightboxImage(null);
        }
        if (showReactionPicker) {
          setShowReactionPicker(null);
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [showForwardModal, showGroupSettings, lightboxImage, showReactionPicker]);

  // 파일 선택 핸들러
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 크기 제한 (20MB)
    if (file.size > 20 * 1024 * 1024) {
      alert('파일 크기는 20MB를 초과할 수 없습니다.');
      return;
    }

    setSelectedFile(file);
  };

  // 메시지 복사 핸들러
  const handleCopyMessage = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      alert('메시지가 복사되었습니다.');
    } catch (error) {
      console.error('Failed to copy message:', error);
    }
    setActiveMessageMenu(null);
  };

  // 이모지 반응 핸들러
  const handleReaction = async (messageId: string, emoji: string) => {
    if (!user) return;

    try {
      const updatedReactions = await toggleReaction(messageId, user.id, emoji);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === messageId
            ? { ...m, metadata: { ...m.metadata, reactions: updatedReactions } }
            : m
        )
      );
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
    setShowReactionPicker(null);
  };

  // 메시지 전달 핸들러
  const handleOpenForwardModal = async (message: MessageWithSender) => {
    setForwardingMessage(message);
    try {
      const conversations = await getConversations(user!.id);
      setForwardConversations(conversations.filter((c) => c.id !== conversationId));
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
    setShowForwardModal(true);
  };

  const handleForwardMessage = async (targetConversationId: string) => {
    if (!user || !forwardingMessage) return;

    setIsForwarding(true);
    try {
      await forwardMessage(forwardingMessage.id, targetConversationId, user.id);
      alert('메시지가 전달되었습니다.');
      setShowForwardModal(false);
      setForwardingMessage(null);
    } catch (error) {
      console.error('Error forwarding message:', error);
      alert('메시지 전달에 실패했습니다.');
    } finally {
      setIsForwarding(false);
    }
  };

  // 그룹 설정 열기
  const handleOpenGroupSettings = async () => {
    try {
      const participants = await getConversationParticipants(conversationId);
      setGroupParticipants(participants);
      setNewGroupTitle(conversation?.title || '');
    } catch (error) {
      console.error('Error loading participants:', error);
    }
    setShowGroupSettings(true);
    setShowHeaderMenu(false);
  };

  // 그룹 제목 변경
  const handleUpdateGroupTitle = async () => {
    if (!newGroupTitle.trim()) return;

    try {
      await updateGroupConversation(conversationId, { title: newGroupTitle.trim() });
      setConversation((prev) => prev ? { ...prev, title: newGroupTitle.trim() } : null);
      alert('그룹명이 변경되었습니다.');
    } catch (error) {
      console.error('Error updating group title:', error);
      alert('그룹명 변경에 실패했습니다.');
    }
  };

  // 참여자 제거
  const handleRemoveParticipant = async (userId: string) => {
    if (!confirm('이 참여자를 그룹에서 제거하시겠습니까?')) return;

    try {
      await removeParticipant(conversationId, userId);
      setGroupParticipants((prev) => prev.filter((p) => p.user_id !== userId));
    } catch (error) {
      console.error('Error removing participant:', error);
      alert('참여자 제거에 실패했습니다.');
    }
  };

  // 참여자 검색
  const handleSearchParticipants = async (query: string) => {
    setParticipantSearchQuery(query);
    if (!query.trim()) {
      setParticipantSearchResults([]);
      return;
    }

    try {
      const results = await searchUsers(query, user!.id);
      // 이미 참여중인 유저 제외
      const existingIds = groupParticipants.map((p) => p.user_id);
      setParticipantSearchResults(results.filter((r) => !existingIds.includes(r.id)));
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  // 참여자 추가
  const handleAddParticipant = async (userId: string) => {
    try {
      await addConversationParticipants(conversationId, [userId]);
      const updatedParticipants = await getConversationParticipants(conversationId);
      setGroupParticipants(updatedParticipants);
      setParticipantSearchQuery('');
      setParticipantSearchResults([]);
      setShowAddParticipant(false);
    } catch (error) {
      console.error('Error adding participant:', error);
      alert('참여자 추가에 실패했습니다.');
    }
  };

  // 멘션 입력 핸들러
  const handleTextChange = async (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setMessageText(text);
    handleTyping();

    // @ 멘션 감지
    const cursorPos = e.target.selectionStart || 0;
    const textBeforeCursor = text.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const afterAt = textBeforeCursor.slice(lastAtIndex + 1);
      // 공백이 없으면 멘션 쿼리로 인식
      if (!afterAt.includes(' ')) {
        setMentionStartIndex(lastAtIndex);
        setMentionQuery(afterAt);

        // 그룹 채팅인 경우 참여자 검색, 아니면 모든 사용자 검색
        if (conversation?.type === 'group' && conversation.participants) {
          const participants = conversation.participants
            .filter((p) => p.user?.nickname.toLowerCase().includes(afterAt.toLowerCase()) && p.user_id !== user?.id)
            .map((p) => p.user)
            .slice(0, 5);
          setMentionSuggestions(participants);
          setShowMentionSuggestions(participants.length > 0);
        } else if (afterAt.length > 0) {
          try {
            const results = await searchUsers(afterAt, user!.id, 5);
            setMentionSuggestions(results);
            setShowMentionSuggestions(results.length > 0);
          } catch (error) {
            console.error('Error searching users for mention:', error);
          }
        } else {
          setShowMentionSuggestions(false);
        }
        return;
      }
    }

    setShowMentionSuggestions(false);
    setMentionStartIndex(null);
  };

  // 멘션 선택 핸들러
  const handleSelectMention = (selectedUser: any) => {
    if (mentionStartIndex === null) return;

    const beforeMention = messageText.slice(0, mentionStartIndex);
    const afterMention = messageText.slice(mentionStartIndex + mentionQuery.length + 1);
    const newText = `${beforeMention}@${selectedUser.nickname} ${afterMention}`;

    setMessageText(newText);
    setShowMentionSuggestions(false);
    setMentionStartIndex(null);
    setMentionQuery('');
  };

  // 메시지 내 멘션 및 링크 렌더링
  const renderMessageContent = (content: string, isOwn: boolean = false) => {
    // URL 정규식
    const urlRegex = /(https?:\/\/[^\s<>"\]]+)/gi;
    // 멘션 정규식
    const mentionRegex = /@(\S+)/g;
    // 결합된 정규식
    const combinedRegex = /(https?:\/\/[^\s<>"\]]+)|(@\S+)/gi;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match;
    let keyIndex = 0;

    while ((match = combinedRegex.exec(content)) !== null) {
      // 매치 이전 텍스트
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }

      // URL인 경우
      if (match[1]) {
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
      }
      // 멘션인 경우
      else if (match[2]) {
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

    // 나머지 텍스트
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }

    return parts.length > 0 ? parts : content;
  };

  // 드래그 앤 드롭 핸들러
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // 이미지 파일과 일반 파일 분리
    const imageFiles = files.filter((f) => f.type.startsWith('image/'));
    const otherFiles = files.filter((f) => !f.type.startsWith('image/'));

    // 이미지 파일 처리
    if (imageFiles.length > 0) {
      if (imageFiles.length + selectedImages.length > 5) {
        alert('이미지는 최대 5개까지 첨부할 수 있습니다.');
        return;
      }
      setSelectedImages((prev) => [...prev, ...imageFiles]);
    }

    // 일반 파일 처리 (첫 번째 파일만)
    if (otherFiles.length > 0) {
      const file = otherFiles[0];
      if (file.size > 20 * 1024 * 1024) {
        alert('파일 크기는 20MB를 초과할 수 없습니다.');
        return;
      }
      setSelectedFile(file);
    }
  };

  // 대화방 나가기 핸들러
  const handleLeaveConversation = async () => {
    if (!user || !confirm('대화방을 나가시겠습니까? 대화 내용은 삭제되지 않습니다.')) return;

    try {
      await leaveConversation(conversationId, user.id);
      router.push('/messages');
    } catch (error) {
      console.error('Error leaving conversation:', error);
      alert('대화방을 나가는 중 오류가 발생했습니다.');
    }
  };

  // 날짜 구분선 표시 여부 확인
  const shouldShowDateDivider = (currentMsg: MessageWithSender, prevMsg?: MessageWithSender) => {
    if (!prevMsg) return true;

    const currentDate = new Date(currentMsg.created_at).toDateString();
    const prevDate = new Date(prevMsg.created_at).toDateString();

    return currentDate !== prevDate;
  };

  // 날짜 포맷
  const formatDate = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return '오늘';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return '어제';
    } else {
      return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      });
    }
  };

  // 파일 크기 포맷
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">대화를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">대화를 찾을 수 없습니다.</p>
          <Link
            href="/messages"
            className="text-blue-600 hover:text-blue-700 font-semibold"
          >
            메시지 목록으로
          </Link>
        </div>
      </div>
    );
  }

  const otherUser = conversation.other_participant;

  return (
    <div
      className="h-screen flex flex-col bg-gray-50 relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-500/20 z-50 flex items-center justify-center border-4 border-dashed border-blue-500 rounded-lg m-4">
          <div className="bg-white px-8 py-6 rounded-xl shadow-lg text-center">
            <FileIcon className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <p className="text-lg font-semibold text-gray-700">파일을 여기에 놓으세요</p>
            <p className="text-sm text-gray-500 mt-1">이미지 또는 파일을 드롭하여 첨부</p>
          </div>
        </div>
      )}

      {/* Forward Modal */}
      {showForwardModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-lg">메시지 전달</h3>
              <button
                onClick={() => {
                  setShowForwardModal(false);
                  setForwardingMessage(null);
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {forwardConversations.length === 0 ? (
                <p className="text-gray-500 text-center py-4">전달할 대화방이 없습니다.</p>
              ) : (
                <div className="space-y-2">
                  {forwardConversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => handleForwardMessage(conv.id)}
                      disabled={isForwarding}
                      className="w-full p-3 flex items-center gap-3 hover:bg-gray-50 rounded-lg transition text-left"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        conv.type === 'group' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        {conv.type === 'group' ? (
                          <Users className="w-5 h-5 text-green-600" />
                        ) : (
                          <span className="text-blue-600 font-semibold">
                            {conv.other_participant?.nickname[0] || '?'}
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
                      {isForwarding && <Loader2 className="w-4 h-4 animate-spin text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Group Settings Modal */}
      {showGroupSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md mx-4">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-lg">그룹 설정</h3>
              <button
                onClick={() => {
                  setShowGroupSettings(false);
                  setShowAddParticipant(false);
                  setParticipantSearchQuery('');
                  setParticipantSearchResults([]);
                }}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* 그룹명 변경 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">그룹명</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newGroupTitle}
                    onChange={(e) => setNewGroupTitle(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="그룹명을 입력하세요"
                  />
                  <button
                    onClick={handleUpdateGroupTitle}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    변경
                  </button>
                </div>
              </div>

              {/* 참여자 목록 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-gray-700">
                    참여자 ({groupParticipants.length}명)
                  </label>
                  <button
                    onClick={() => setShowAddParticipant(!showAddParticipant)}
                    className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <UserPlus className="w-4 h-4" />
                    추가
                  </button>
                </div>

                {/* 참여자 추가 검색 */}
                {showAddParticipant && (
                  <div className="mb-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={participantSearchQuery}
                        onChange={(e) => handleSearchParticipants(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="사용자 검색..."
                      />
                    </div>
                    {participantSearchResults.length > 0 && (
                      <div className="mt-2 border border-gray-200 rounded-lg overflow-hidden">
                        {participantSearchResults.map((user) => (
                          <button
                            key={user.id}
                            onClick={() => handleAddParticipant(user.id)}
                            className="w-full p-2 flex items-center gap-2 hover:bg-gray-50 text-left"
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

                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {groupParticipants.map((participant) => (
                    <div
                      key={participant.user_id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
                    >
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {participant.user?.nickname[0] || '?'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{participant.user?.nickname}</p>
                        <p className="text-xs text-gray-500">{participant.role === 'admin' ? '관리자' : '멤버'}</p>
                      </div>
                      {participant.user_id !== user?.id && participant.role !== 'admin' && (
                        <button
                          onClick={() => handleRemoveParticipant(participant.user_id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                          title="제거"
                        >
                          <UserMinus className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Lightbox */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          onClick={() => setLightboxImage(null)}
        >
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-4 right-4 p-2 text-white hover:bg-white/20 rounded-full transition"
          >
            <X className="w-6 h-6" />
          </button>
          <NextImage
            src={lightboxImage}
            alt="Enlarged"
            width={1200}
            height={800}
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center gap-4 sticky top-0 z-10">
        <Link
          href="/messages"
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="flex items-center gap-3 flex-1">
          <div className="relative">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
              conversation.type === 'group' ? 'bg-green-100' : 'bg-blue-100'
            }`}>
              {conversation.type === 'group' ? (
                <Users className="w-5 h-5 text-green-600" />
              ) : (
                <span className="text-blue-600 font-semibold">
                  {otherUser?.nickname[0] || '?'}
                </span>
              )}
            </div>
            {conversation.type !== 'group' && otherUserPresence?.status === 'online' && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            )}
          </div>

          <div>
            <h2 className="font-semibold text-gray-900">
              {conversation.type === 'group'
                ? conversation.title || '그룹 채팅'
                : otherUser?.nickname || '대화'}
            </h2>
            <p className="text-xs text-gray-500">
              {conversation.type === 'group'
                ? `${conversation.participants.filter(p => !p.left_at).length}명 참여 중`
                : otherUserPresence?.status === 'online'
                ? '온라인'
                : otherUserPresence?.last_seen_at
                ? `최근 접속: ${getTimeAgo(new Date(otherUserPresence.last_seen_at))}`
                : '오프라인'}
            </p>
          </div>
        </div>

        {/* Header Menu */}
        <div className="relative">
          <button
            onClick={() => setShowHeaderMenu(!showHeaderMenu)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <MoreVertical className="w-5 h-5 text-gray-600" />
          </button>

          {showHeaderMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowHeaderMenu(false)}
              />
              <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20 overflow-hidden">
                {conversation.type === 'group' && (
                  <button
                    onClick={handleOpenGroupSettings}
                    className="w-full px-4 py-3 text-left text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Settings className="w-4 h-4" />
                    그룹 설정
                  </button>
                )}
                <button
                  onClick={handleLeaveConversation}
                  className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  대화방 나가기
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
      >
        {/* Load More Indicator */}
        {isLoadingMore && (
          <div className="flex justify-center py-4">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          </div>
        )}

        {!hasMore && messages.length > 0 && (
          <div className="text-center text-gray-400 text-sm py-2">
            대화의 시작입니다
          </div>
        )}

        {messages.map((message, index) => {
          const prevMessage = index > 0 ? messages[index - 1] : undefined;
          const showDateDivider = shouldShowDateDivider(message, prevMessage);
          const isOwn = message.sender_id === user.id;
          const showAvatar =
            !isOwn &&
            (index === 0 || messages[index - 1].sender_id !== message.sender_id);
          const showTime =
            index === messages.length - 1 ||
            messages[index + 1].sender_id !== message.sender_id;
          const isFirstUnread = message.id === firstUnreadMessageId;
          const showMobileActions = touchedMessageId === message.id;

          return (
            <div
              key={message.id}
              ref={isFirstUnread ? firstUnreadRef : undefined}
            >
              {/* Date Divider */}
              {showDateDivider && (
                <div className="flex items-center justify-center my-4">
                  <div className="flex-1 border-t border-gray-200" />
                  <span className="px-4 text-xs text-gray-500 bg-gray-50">
                    {formatDate(new Date(message.created_at))}
                  </span>
                  <div className="flex-1 border-t border-gray-200" />
                </div>
              )}

              {/* Unread Messages Divider */}
              {isFirstUnread && (
                <div className="flex items-center justify-center my-4">
                  <div className="flex-1 border-t border-orange-400" />
                  <span className="px-4 text-xs text-orange-600 bg-orange-50 rounded-full">
                    여기서부터 읽지 않은 메시지
                  </span>
                  <div className="flex-1 border-t border-orange-400" />
                </div>
              )}

              <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-2 max-w-[75%] ${isOwn ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                {!isOwn && (
                  <div className="w-8 h-8 flex-shrink-0">
                    {showAvatar && (
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
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
                  onClick={() => handleMessageTouch(message.id)}
                >
                  {/* Reply Preview */}
                  {message.reply_to && (
                    <div className="text-xs text-gray-500 mb-1 px-3 py-1 bg-gray-100 rounded border-l-2 border-gray-300">
                      {message.reply_to.content?.substring(0, 50)}
                    </div>
                  )}

                  {/* Deleted Message */}
                  {message.is_deleted ? (
                    <div className="px-4 py-2 bg-gray-200 rounded-2xl text-gray-500 italic">
                      삭제된 메시지입니다
                    </div>
                  ) : (
                    <>
                      {/* Images */}
                      {message.image_urls && message.image_urls.length > 0 && (
                        <div className="mb-1 space-y-1">
                          {message.image_urls.map((url, i) => (
                            <div
                              key={i}
                              className="relative max-w-full rounded-lg overflow-hidden cursor-pointer"
                              onClick={() => setLightboxImage(url)}
                            >
                              <NextImage
                                src={url}
                                alt="Attached"
                                width={400}
                                height={300}
                                className="rounded-lg hover:opacity-90 transition"
                                style={{ maxWidth: '100%', height: 'auto' }}
                              />
                            </div>
                          ))}
                        </div>
                      )}

                      {/* File Attachment */}
                      {message.file_url && (
                        <a
                          href={message.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center gap-3 p-3 rounded-lg border ${
                            isOwn
                              ? 'bg-blue-500 border-blue-400'
                              : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className={`p-2 rounded ${isOwn ? 'bg-blue-400' : 'bg-gray-100'}`}>
                            <FileIcon className={`w-5 h-5 ${isOwn ? 'text-white' : 'text-gray-600'}`} />
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
                          <Download className={`w-5 h-5 ${isOwn ? 'text-white' : 'text-gray-600'}`} />
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
                            <p className="whitespace-pre-wrap break-words">
                              {editingMessage?.id === message.id ? (
                                <input
                                  type="text"
                                  value={editText}
                                  onChange={(e) => setEditText(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleEditSave();
                                    if (e.key === 'Escape') {
                                      setEditingMessage(null);
                                      setEditText('');
                                    }
                                  }}
                                  className="w-full bg-transparent border-none outline-none"
                                  autoFocus
                                />
                              ) : (
                                renderMessageContent(message.content, isOwn)
                              )}
                            </p>
                            {message.is_edited && (
                              <span className={`text-xs ${isOwn ? 'text-blue-200' : 'text-gray-400'}`}>
                                (수정됨)
                              </span>
                            )}
                          </div>
                          {/* Link Preview */}
                          {extractUrls(message.content).slice(0, 1).map((url, idx) => (
                            <LinkPreview key={idx} url={url} isOwn={isOwn} />
                          ))}
                        </div>
                      )}
                    </>
                  )}

                  {/* Time and Read Status */}
                  {showTime && (
                    <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : ''}`}>
                      <span className="text-xs text-gray-400">
                        {formatTime(new Date(message.created_at))}
                      </span>
                      {isOwn && (
                        <span className="text-gray-400">
                          {message.read_by && message.read_by.length > 1 ? (
                            <CheckCheck className="w-3 h-3 text-blue-500" />
                          ) : (
                            <Check className="w-3 h-3" />
                          )}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Message Reactions Display */}
                  {message.metadata?.reactions && Object.keys(message.metadata.reactions).length > 0 && (
                    <MessageReactions
                      reactions={message.metadata.reactions}
                      currentUserId={user.id}
                      onToggle={(emoji) => handleReaction(message.id, emoji)}
                    />
                  )}

                  {/* Message Actions */}
                  {!message.is_deleted && (
                    <div
                      className={`absolute top-0 ${
                        isOwn ? 'left-0 -translate-x-full' : 'right-0 translate-x-full'
                      } ${showMobileActions ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition px-2`}
                    >
                      <div className="flex flex-col gap-1">
                        {/* Quick Reactions */}
                        {showReactionPicker === message.id ? (
                          <div className="relative">
                            <QuickReactions onSelect={(emoji) => handleReaction(message.id, emoji)} />
                            <button
                              onClick={() => setShowReactionPicker(null)}
                              className="absolute -top-2 -right-2 w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ) : null}

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1 bg-white shadow-sm rounded-lg border border-gray-200 p-1">
                          <button
                            onClick={() => setShowReactionPicker(showReactionPicker === message.id ? null : message.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="반응"
                          >
                            <Smile className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => setReplyTo(message)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="답장"
                          >
                            <Reply className="w-4 h-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleOpenForwardModal(message)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="전달"
                          >
                            <Forward className="w-4 h-4 text-gray-600" />
                          </button>
                          {message.content && (
                            <button
                              onClick={() => handleCopyMessage(message.content || '')}
                              className="p-1 hover:bg-gray-100 rounded"
                              title="복사"
                            >
                              <Copy className="w-4 h-4 text-gray-600" />
                            </button>
                          )}
                          {isOwn && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingMessage(message);
                                  setEditText(message.content || '');
                                }}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="수정"
                              >
                                <Edit className="w-4 h-4 text-gray-600" />
                              </button>
                              <button
                                onClick={() => handleDelete(message.id)}
                                className="p-1 hover:bg-gray-100 rounded"
                                title="삭제"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <div className="flex space-x-1">
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
              <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
            </div>
            <span>입력 중...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Jump to Unread Banner */}
      {showJumpToUnread && firstUnreadMessageId && (
        <div className="absolute top-32 left-1/2 transform -translate-x-1/2 z-20">
          <button
            onClick={scrollToFirstUnread}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-full shadow-lg hover:bg-orange-600 transition"
          >
            <ChevronDown className="w-4 h-4 rotate-180" />
            읽지 않은 메시지로 이동
          </button>
        </div>
      )}

      {/* New Message Banner */}
      {showNewMessageBanner && (
        <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-20">
          <button
            onClick={() => {
              scrollToBottom();
              setShowNewMessageBanner(false);
              setNewMessageCount(0);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition"
          >
            <ChevronDown className="w-4 h-4" />
            새 메시지 {newMessageCount > 0 && `(${newMessageCount})`}
          </button>
        </div>
      )}

      {/* Reply Preview */}
      {replyTo && (
        <div className="px-4 py-2 bg-gray-100 border-t border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Reply className="w-4 h-4 text-gray-500" />
            <div className="text-sm">
              <span className="font-semibold">{replyTo.sender.nickname}</span>
              <span className="text-gray-500 ml-2">
                {replyTo.content?.substring(0, 50)}
                {(replyTo.content?.length || 0) > 50 && '...'}
              </span>
            </div>
          </div>
          <button onClick={() => setReplyTo(null)} className="p-1 hover:bg-gray-200 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Image Preview */}
      {selectedImages.length > 0 && (
        <div className="px-4 py-2 bg-gray-100 border-t border-gray-200">
          <div className="flex gap-2 overflow-x-auto">
            {selectedImages.map((file, index) => (
              <div key={index} className="relative flex-shrink-0">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                  <NextImage
                    src={URL.createObjectURL(file)}
                    alt="Preview"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <button
                  onClick={() =>
                    setSelectedImages(selectedImages.filter((_, i) => i !== index))
                  }
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* File Preview */}
      {selectedFile && (
        <div className="px-4 py-2 bg-gray-100 border-t border-gray-200">
          <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-gray-200">
            <div className="p-2 bg-gray-100 rounded">
              <FileIcon className="w-5 h-5 text-gray-600" />
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
              className="p-1 hover:bg-gray-200 rounded"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-4 py-3">
        <div className="flex items-end gap-2">
          {/* Image Button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="이미지 첨부"
          >
            <ImageIcon className="w-5 h-5 text-gray-600" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageSelect}
            className="hidden"
          />

          {/* File Button */}
          <button
            onClick={() => documentInputRef.current?.click()}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
            title="파일 첨부"
          >
            <FileIcon className="w-5 h-5 text-gray-600" />
          </button>
          <input
            ref={documentInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex-1 relative">
            {/* Mention Suggestions */}
            {showMentionSuggestions && mentionSuggestions.length > 0 && (
              <div className="absolute bottom-full mb-2 left-0 right-0 bg-white border border-gray-200 rounded-lg shadow-lg z-20 max-h-48 overflow-y-auto">
                {mentionSuggestions.map((suggestedUser) => (
                  <button
                    key={suggestedUser.id}
                    onClick={() => handleSelectMention(suggestedUser)}
                    className="w-full p-3 flex items-center gap-3 hover:bg-blue-50 text-left transition"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-semibold text-sm">
                        {suggestedUser.nickname[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{suggestedUser.nickname}</p>
                      <p className="text-xs text-gray-500">{suggestedUser.role || '사용자'}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <textarea
              ref={textareaRef}
              value={messageText}
              onChange={handleTextChange}
              onKeyDown={handleKeyPress}
              placeholder="메시지를 입력하세요... (@로 멘션)"
              rows={1}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none max-h-32"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={isSending || (!messageText.trim() && selectedImages.length === 0 && !selectedFile)}
            className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return '방금';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}분 전`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}시간 전`;
  return `${Math.floor(seconds / 86400)}일 전`;
}

export default function ChatRoomPage() {
  const params = useParams();
  const { user } = useAuthStore();

  return (
    <ErrorBoundary
      level="page"
      onError={(error, errorInfo) => {
        logError(error, errorInfo, {
          userId: user?.id,
          severity: 'high',
          additionalData: {
            page: 'chat-room',
            conversationId: params.id,
          },
        });
      }}
    >
      <ChatRoomPageContent />
    </ErrorBoundary>
  );
}
