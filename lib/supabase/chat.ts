import { supabase } from './client';
import type {
  Conversation,
  ConversationWithDetails,
  Message,
  MessageWithSender,
  UserPresence,
  MessageSearchResult,
} from '@/types';

// Get or create direct conversation between two users
export async function getOrCreateDirectConversation(userId1: string, userId2: string) {
  const { data, error } = await supabase.rpc('get_or_create_direct_conversation', {
    p_user_id_1: userId1,
    p_user_id_2: userId2,
  });

  if (error) throw error;
  return data as string;
}

// Get user's conversations with details
export async function getConversations(userId: string): Promise<ConversationWithDetails[]> {
  const { data: conversations, error } = await supabase
    .from('conversations')
    .select(`
      *,
      conversation_participants!inner (
        *,
        user:users (
          id,
          nickname,
          avatar_url,
          role
        )
      )
    `)
    .eq('conversation_participants.user_id', userId)
    .is('conversation_participants.left_at', null)
    .eq('is_active', true)
    .order('last_message_at', { ascending: false, nullsFirst: false });

  if (error) throw error;

  // Calculate unread counts and get other participant for direct chats
  const conversationsWithDetails = await Promise.all(
    (conversations || []).map(async (conv) => {
      // Get unread count
      const { count } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', conv.id)
        .neq('sender_id', userId)
        .not('id', 'in', `(SELECT message_id FROM message_reads WHERE user_id = '${userId}')`);

      // Get other participant for direct chats
      let otherParticipant = undefined;
      if (conv.type === 'direct') {
        const other = conv.conversation_participants.find(
          (p: any) => p.user_id !== userId
        );
        if (other) {
          otherParticipant = other.user;
        }
      }

      return {
        ...conv,
        participants: conv.conversation_participants,
        unread_count: count || 0,
        other_participant: otherParticipant,
      };
    })
  );

  return conversationsWithDetails;
}

// Get single conversation with details
export async function getConversation(conversationId: string): Promise<ConversationWithDetails | null> {
  const { data, error } = await supabase
    .from('conversations')
    .select(`
      *,
      conversation_participants (
        *,
        user:users (
          id,
          nickname,
          avatar_url,
          role
        )
      )
    `)
    .eq('id', conversationId)
    .single();

  if (error) throw error;

  return {
    ...data,
    participants: data.conversation_participants,
    unread_count: 0,
  } as ConversationWithDetails;
}

// Get messages for a conversation
export async function getMessages(
  conversationId: string,
  limit = 50,
  before?: string
): Promise<MessageWithSender[]> {
  let query = supabase
    .from('messages')
    .select(`
      *,
      sender:users!sender_id (
        id,
        nickname,
        avatar_url,
        role
      ),
      reply_to:messages!reply_to_id (
        id,
        content,
        sender_id
      )
    `)
    .eq('conversation_id', conversationId)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (before) {
    query = query.lt('created_at', before);
  }

  const { data, error } = await query;

  if (error) throw error;

  // Get read receipts
  const messagesWithReads = await Promise.all(
    (data || []).map(async (msg) => {
      const { data: reads } = await supabase
        .from('message_reads')
        .select('user_id')
        .eq('message_id', msg.id);

      return {
        ...msg,
        read_by: reads?.map((r) => r.user_id) || [],
      };
    })
  );

  return messagesWithReads.reverse() as MessageWithSender[];
}

// Send a message
export async function sendMessage(data: {
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type?: string;
  image_urls?: string[];
  reply_to_id?: string;
}) {
  const { data: messageId, error } = await supabase.rpc('send_message', {
    p_conversation_id: data.conversation_id,
    p_sender_id: data.sender_id,
    p_content: data.content,
    p_message_type: data.message_type || 'text',
    p_image_urls: data.image_urls || [],
    p_reply_to_id: data.reply_to_id || null,
  });

  if (error) throw error;

  // Get the created message with sender info
  const { data: message, error: fetchError } = await supabase
    .from('messages')
    .select(`
      *,
      sender:users!sender_id (
        id,
        nickname,
        avatar_url,
        role
      )
    `)
    .eq('id', messageId)
    .single();

  if (fetchError) throw fetchError;

  return message as MessageWithSender;
}

// Mark messages as read
export async function markMessagesAsRead(conversationId: string, userId: string) {
  const { error } = await supabase.rpc('mark_messages_read', {
    p_conversation_id: conversationId,
    p_user_id: userId,
  });

  if (error) throw error;
}

// Get unread message count
export async function getUnreadMessageCount(userId: string): Promise<number> {
  const { data, error } = await supabase.rpc('get_unread_message_count', {
    p_user_id: userId,
  });

  if (error) throw error;
  return data || 0;
}

// Update message (edit)
export async function updateMessage(messageId: string, content: string) {
  const { data, error } = await supabase
    .from('messages')
    .update({
      content,
      is_edited: true,
    })
    .eq('id', messageId)
    .select()
    .single();

  if (error) throw error;
  return data as Message;
}

// Delete message (soft delete)
export async function deleteMessage(messageId: string) {
  const { error } = await supabase
    .from('messages')
    .update({
      is_deleted: true,
      deleted_at: new Date().toISOString(),
    })
    .eq('id', messageId);

  if (error) throw error;
}

// Update user presence
export async function updatePresence(
  userId: string,
  status: 'online' | 'away' | 'offline',
  conversationId?: string
) {
  const { error } = await supabase.rpc('update_user_presence', {
    p_user_id: userId,
    p_status: status,
    p_conversation_id: conversationId || null,
  });

  if (error) throw error;
}

// Get user presence
export async function getUserPresence(userId: string): Promise<UserPresence | null> {
  const { data, error } = await supabase
    .from('user_presence')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data as UserPresence | null;
}

// Get multiple users presence
export async function getUsersPresence(userIds: string[]): Promise<UserPresence[]> {
  const { data, error } = await supabase
    .from('user_presence')
    .select('*')
    .in('user_id', userIds);

  if (error) throw error;
  return data as UserPresence[];
}

// Search messages
export async function searchMessages(
  userId: string,
  query: string,
  limit = 50
): Promise<MessageSearchResult[]> {
  const { data, error } = await supabase.rpc('search_messages', {
    p_user_id: userId,
    p_query: query,
    p_limit: limit,
  });

  if (error) throw error;
  return data as MessageSearchResult[];
}

// Toggle conversation mute
export async function toggleMuteConversation(conversationId: string, userId: string) {
  const { data: participant } = await supabase
    .from('conversation_participants')
    .select('is_muted')
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)
    .single();

  const { error } = await supabase
    .from('conversation_participants')
    .update({ is_muted: !participant?.is_muted })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId);

  if (error) throw error;
  return !participant?.is_muted;
}

// Toggle conversation pin
export async function togglePinConversation(conversationId: string, userId: string) {
  const { data: participant } = await supabase
    .from('conversation_participants')
    .select('is_pinned')
    .eq('conversation_id', conversationId)
    .eq('user_id', userId)
    .single();

  const { error } = await supabase
    .from('conversation_participants')
    .update({ is_pinned: !participant?.is_pinned })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId);

  if (error) throw error;
  return !participant?.is_pinned;
}

// Leave conversation
export async function leaveConversation(conversationId: string, userId: string) {
  const { error } = await supabase
    .from('conversation_participants')
    .update({ left_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .eq('user_id', userId);

  if (error) throw error;
}

// Subscribe to new messages in a conversation
export function subscribeToMessages(
  conversationId: string,
  callback: (message: MessageWithSender) => void
) {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      async (payload) => {
        // Fetch full message with sender info
        const { data } = await supabase
          .from('messages')
          .select(`
            *,
            sender:users!sender_id (
              id,
              nickname,
              avatar_url,
              role
            )
          `)
          .eq('id', payload.new.id)
          .single();

        if (data) {
          callback(data as MessageWithSender);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      async (payload) => {
        const { data } = await supabase
          .from('messages')
          .select(`
            *,
            sender:users!sender_id (
              id,
              nickname,
              avatar_url,
              role
            )
          `)
          .eq('id', payload.new.id)
          .single();

        if (data) {
          callback(data as MessageWithSender);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Subscribe to conversation updates (new messages in any conversation)
export function subscribeToConversations(
  userId: string,
  callback: (conversation: Conversation) => void
) {
  const channel = supabase
    .channel(`conversations:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations',
      },
      (payload) => {
        callback(payload.new as Conversation);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Subscribe to typing indicators using Presence
export function subscribeToTyping(
  conversationId: string,
  userId: string,
  onTypingChange: (typingUsers: string[]) => void
) {
  const channel = supabase.channel(`typing:${conversationId}`, {
    config: {
      presence: {
        key: userId,
      },
    },
  });

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const typingUsers = Object.keys(state).filter((key) => {
        const presence = state[key] as any[];
        return presence.some((p) => p.is_typing);
      });
      onTypingChange(typingUsers);
    })
    .subscribe();

  return {
    setTyping: (isTyping: boolean) => {
      channel.track({ is_typing: isTyping });
    },
    unsubscribe: () => {
      supabase.removeChannel(channel);
    },
  };
}

// Subscribe to user presence changes
export function subscribeToPresence(
  userIds: string[],
  callback: (presence: UserPresence) => void
) {
  const channel = supabase
    .channel('presence')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_presence',
        filter: `user_id=in.(${userIds.join(',')})`,
      },
      (payload) => {
        callback(payload.new as UserPresence);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// Subscribe to read receipts
export function subscribeToReadReceipts(
  conversationId: string,
  callback: (messageId: string, userId: string) => void
) {
  const channel = supabase
    .channel(`reads:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'message_reads',
      },
      async (payload) => {
        // Check if this read is for our conversation
        const { data: message } = await supabase
          .from('messages')
          .select('conversation_id')
          .eq('id', payload.new.message_id)
          .single();

        if (message?.conversation_id === conversationId) {
          callback(payload.new.message_id, payload.new.user_id);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
