'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
  toggleReaction,
} from '@/lib/supabase/chat';
import { uploadImage, uploadFile } from '@/lib/supabase/storage';
import type { ConversationWithDetails, MessageWithSender, UserPresence } from '@/types';

interface UseChatOptions {
  conversationId: string;
  userId: string | undefined;
}

interface ChatState {
  conversation: ConversationWithDetails | null;
  messages: MessageWithSender[];
  isLoading: boolean;
  hasMore: boolean;
  isLoadingMore: boolean;
  typingUsers: string[];
  otherUserPresence: UserPresence | null;
  firstUnreadMessageId: string | null;
}

const MESSAGES_PER_PAGE = 50;

export function useChat({ conversationId, userId }: UseChatOptions) {
  const [state, setState] = useState<ChatState>({
    conversation: null,
    messages: [],
    isLoading: true,
    hasMore: true,
    isLoadingMore: false,
    typingUsers: [],
    otherUserPresence: null,
    firstUnreadMessageId: null,
  });

  const setTypingRef = useRef<((isTyping: boolean) => void) | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Load initial data
  const loadData = useCallback(async () => {
    if (!userId) return;

    try {
      setState(prev => ({ ...prev, isLoading: true }));

      const [convData, messagesData] = await Promise.all([
        getConversation(conversationId),
        getMessages(conversationId, MESSAGES_PER_PAGE),
      ]);

      // Find first unread message
      const firstUnread = messagesData.find(
        (msg) => msg.sender_id !== userId && !(msg.read_by || []).includes(userId)
      );

      setState(prev => ({
        ...prev,
        conversation: convData,
        messages: messagesData,
        hasMore: messagesData.length >= MESSAGES_PER_PAGE,
        firstUnreadMessageId: firstUnread?.id || null,
        isLoading: false,
      }));

      // Mark messages as read
      await markMessagesAsRead(conversationId, userId);

      // Get other user's presence
      if (convData?.other_participant) {
        const presence = await getUserPresence(convData.other_participant.id);
        setState(prev => ({ ...prev, otherUserPresence: presence }));
      }
    } catch (error) {
      console.error('Error loading chat:', error);
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [conversationId, userId]);

  // Load more messages (infinite scroll)
  const loadMoreMessages = useCallback(async () => {
    if (!state.hasMore || state.isLoadingMore || state.messages.length === 0) return;

    try {
      setState(prev => ({ ...prev, isLoadingMore: true }));
      const oldestMessage = state.messages[0];
      const olderMessages = await getMessages(conversationId, MESSAGES_PER_PAGE, oldestMessage.created_at);

      setState(prev => ({
        ...prev,
        messages: [...olderMessages, ...prev.messages],
        hasMore: olderMessages.length >= MESSAGES_PER_PAGE,
        isLoadingMore: false,
      }));
    } catch (error) {
      console.error('Error loading more messages:', error);
      setState(prev => ({ ...prev, isLoadingMore: false }));
    }
  }, [conversationId, state.hasMore, state.isLoadingMore, state.messages]);

  // Send message
  const handleSendMessage = useCallback(async (params: {
    content: string;
    images?: File[];
    file?: File | null;
    replyToId?: string;
  }) => {
    if (!userId) return;

    const { content, images = [], file, replyToId } = params;

    try {
      // Upload images
      let imageUrls: string[] = [];
      if (images.length > 0) {
        imageUrls = await Promise.all(
          images.map((f) => uploadImage(f, 'chat-images'))
        );
      }

      // Upload file
      let fileUrl: string | undefined;
      let fileName: string | undefined;
      let fileSize: number | undefined;
      if (file) {
        fileUrl = await uploadFile(file, 'chat-files');
        fileName = file.name;
        fileSize = file.size;
      }

      // Determine message type
      let messageType = 'text';
      if (imageUrls.length > 0) messageType = 'image';
      else if (fileUrl) messageType = 'file';

      await sendMessage({
        conversation_id: conversationId,
        sender_id: userId,
        content,
        message_type: messageType,
        image_urls: imageUrls,
        file_url: fileUrl,
        file_name: fileName,
        file_size: fileSize,
        reply_to_id: replyToId,
      });

      // Stop typing indicator
      setTypingRef.current?.(false);
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, [conversationId, userId]);

  // Update message
  const handleUpdateMessage = useCallback(async (messageId: string, content: string) => {
    try {
      await updateMessage(messageId, content);
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(m =>
          m.id === messageId ? { ...m, content, is_edited: true } : m
        ),
      }));
    } catch (error) {
      console.error('Error updating message:', error);
      throw error;
    }
  }, []);

  // Delete message
  const handleDeleteMessage = useCallback(async (messageId: string) => {
    try {
      await deleteMessage(messageId);
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(m =>
          m.id === messageId ? { ...m, is_deleted: true } : m
        ),
      }));
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  }, []);

  // Toggle reaction
  const handleToggleReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!userId) return;

    try {
      const updatedReactions = await toggleReaction(messageId, userId, emoji);
      setState(prev => ({
        ...prev,
        messages: prev.messages.map(m =>
          m.id === messageId
            ? { ...m, metadata: { ...m.metadata, reactions: updatedReactions } }
            : m
        ),
      }));
    } catch (error) {
      console.error('Error toggling reaction:', error);
    }
  }, [userId]);

  // Typing indicator
  const setTyping = useCallback((isTyping: boolean) => {
    setTypingRef.current?.(isTyping);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (isTyping) {
      typingTimeoutRef.current = setTimeout(() => {
        setTypingRef.current?.(false);
      }, 2000);
    }
  }, []);

  // Setup subscriptions
  useEffect(() => {
    if (!userId) return;

    loadData();
    updatePresence(userId, 'online', conversationId);

    // Subscribe to new messages
    const unsubscribeMessages = subscribeToMessages(conversationId, (newMessage) => {
      setState(prev => {
        if (prev.messages.find(m => m.id === newMessage.id)) {
          return {
            ...prev,
            messages: prev.messages.map(m => m.id === newMessage.id ? newMessage : m),
          };
        }
        return { ...prev, messages: [...prev.messages, newMessage] };
      });

      if (newMessage.sender_id !== userId) {
        markMessagesAsRead(conversationId, userId);
      }
    });

    // Subscribe to typing
    const typingSubscription = subscribeToTyping(
      conversationId,
      userId,
      (users) => {
        setState(prev => ({
          ...prev,
          typingUsers: users.filter(id => id !== userId),
        }));
      }
    );
    setTypingRef.current = typingSubscription.setTyping;

    // Subscribe to read receipts
    const unsubscribeReads = subscribeToReadReceipts(
      conversationId,
      (messageId, readUserId) => {
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(m =>
            m.id === messageId
              ? { ...m, read_by: [...(m.read_by || []), readUserId] }
              : m
          ),
        }));
      }
    );

    return () => {
      unsubscribeMessages();
      typingSubscription.unsubscribe();
      unsubscribeReads();
      updatePresence(userId, 'online');
    };
  }, [conversationId, userId, loadData]);

  return {
    ...state,
    loadMoreMessages,
    sendMessage: handleSendMessage,
    updateMessage: handleUpdateMessage,
    deleteMessage: handleDeleteMessage,
    toggleReaction: handleToggleReaction,
    setTyping,
    setConversation: (conv: ConversationWithDetails | null) =>
      setState(prev => ({ ...prev, conversation: conv })),
  };
}
