-- Chat system migration for StudyBridge
-- Implements real-time messaging with read receipts, typing indicators, and online presence

-- Conversations table (대화방)
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  type TEXT NOT NULL DEFAULT 'direct' CHECK (type IN ('direct', 'group', 'tutoring')),
  title TEXT, -- For group chats
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  question_id UUID REFERENCES public.questions(id) ON DELETE SET NULL, -- Link to question if applicable
  tutoring_session_id UUID REFERENCES public.tutoring_sessions(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ,
  last_message_preview TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Conversation participants (대화방 참여자)
CREATE TABLE public.conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  nickname_override TEXT, -- Optional custom nickname for this conversation
  is_muted BOOLEAN NOT NULL DEFAULT false,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  last_read_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  left_at TIMESTAMPTZ,
  UNIQUE(conversation_id, user_id)
);

-- Messages table (메시지)
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system', 'question_link')),
  image_urls TEXT[] DEFAULT '{}',
  file_url TEXT,
  file_name TEXT,
  file_size INTEGER,
  reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
  is_edited BOOLEAN NOT NULL DEFAULT false,
  is_deleted BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}', -- For reactions, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Message reads (읽음 확인)
CREATE TABLE public.message_reads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  read_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- User presence (온라인 상태)
CREATE TABLE public.user_presence (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'away', 'offline')),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  current_conversation_id UUID REFERENCES public.conversations(id) ON DELETE SET NULL
);

-- Typing indicators (타이핑 표시) - Using Supabase Realtime Presence instead of table
-- This will be handled client-side with Supabase Presence

-- Create indexes for better performance
CREATE INDEX idx_conversations_last_message ON public.conversations(last_message_at DESC);
CREATE INDEX idx_conversation_participants_user ON public.conversation_participants(user_id);
CREATE INDEX idx_conversation_participants_conversation ON public.conversation_participants(conversation_id);
CREATE INDEX idx_messages_conversation ON public.messages(conversation_id, created_at DESC);
CREATE INDEX idx_messages_sender ON public.messages(sender_id);
CREATE INDEX idx_message_reads_message ON public.message_reads(message_id);
CREATE INDEX idx_message_reads_user ON public.message_reads(user_id);
CREATE INDEX idx_user_presence_status ON public.user_presence(status);

-- Enable Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_presence ENABLE ROW LEVEL SECURITY;

-- RLS Policies for conversations
CREATE POLICY "Users can view conversations they participate in"
  ON public.conversations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = id AND user_id = auth.uid() AND left_at IS NULL
    )
  );

CREATE POLICY "Authenticated users can create conversations"
  ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Participants can update conversation"
  ON public.conversations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = id AND user_id = auth.uid() AND left_at IS NULL
    )
  );

-- RLS Policies for conversation_participants
CREATE POLICY "Users can view participants of their conversations"
  ON public.conversation_participants FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.conversation_participants cp
      WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid() AND cp.left_at IS NULL
    )
  );

CREATE POLICY "Users can join conversations"
  ON public.conversation_participants FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update their own participation"
  ON public.conversation_participants FOR UPDATE
  USING (user_id = auth.uid());

-- RLS Policies for messages
CREATE POLICY "Users can view messages in their conversations"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = messages.conversation_id AND user_id = auth.uid() AND left_at IS NULL
    )
  );

CREATE POLICY "Participants can send messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = messages.conversation_id AND user_id = auth.uid() AND left_at IS NULL
    )
  );

CREATE POLICY "Senders can update their messages"
  ON public.messages FOR UPDATE
  USING (sender_id = auth.uid());

CREATE POLICY "Senders can delete their messages"
  ON public.messages FOR DELETE
  USING (sender_id = auth.uid());

-- RLS Policies for message_reads
CREATE POLICY "Users can view read receipts for their conversations"
  ON public.message_reads FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.messages m
      JOIN public.conversation_participants cp ON cp.conversation_id = m.conversation_id
      WHERE m.id = message_id AND cp.user_id = auth.uid() AND cp.left_at IS NULL
    )
  );

CREATE POLICY "Users can mark messages as read"
  ON public.message_reads FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- RLS Policies for user_presence
CREATE POLICY "Anyone can view user presence"
  ON public.user_presence FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own presence"
  ON public.user_presence FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own presence status"
  ON public.user_presence FOR UPDATE
  USING (user_id = auth.uid());

-- Add updated_at triggers
CREATE TRIGGER update_conversations_updated_at
  BEFORE UPDATE ON public.conversations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON public.messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create or get direct conversation between two users
CREATE OR REPLACE FUNCTION get_or_create_direct_conversation(
  p_user_id_1 UUID,
  p_user_id_2 UUID
)
RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
BEGIN
  -- Find existing direct conversation between two users
  SELECT c.id INTO v_conversation_id
  FROM public.conversations c
  WHERE c.type = 'direct'
    AND EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = c.id AND user_id = p_user_id_1 AND left_at IS NULL
    )
    AND EXISTS (
      SELECT 1 FROM public.conversation_participants
      WHERE conversation_id = c.id AND user_id = p_user_id_2 AND left_at IS NULL
    )
    AND (
      SELECT COUNT(*) FROM public.conversation_participants
      WHERE conversation_id = c.id AND left_at IS NULL
    ) = 2
  LIMIT 1;

  -- If not found, create new conversation
  IF v_conversation_id IS NULL THEN
    INSERT INTO public.conversations (type, created_by)
    VALUES ('direct', p_user_id_1)
    RETURNING id INTO v_conversation_id;

    -- Add both participants
    INSERT INTO public.conversation_participants (conversation_id, user_id)
    VALUES
      (v_conversation_id, p_user_id_1),
      (v_conversation_id, p_user_id_2);
  END IF;

  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send a message
CREATE OR REPLACE FUNCTION send_message(
  p_conversation_id UUID,
  p_sender_id UUID,
  p_content TEXT,
  p_message_type TEXT DEFAULT 'text',
  p_image_urls TEXT[] DEFAULT '{}',
  p_reply_to_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_message_id UUID;
  v_preview TEXT;
BEGIN
  -- Insert message
  INSERT INTO public.messages (
    conversation_id, sender_id, content, message_type, image_urls, reply_to_id
  )
  VALUES (
    p_conversation_id, p_sender_id, p_content, p_message_type, p_image_urls, p_reply_to_id
  )
  RETURNING id INTO v_message_id;

  -- Create preview text
  IF p_message_type = 'image' THEN
    v_preview := '📷 이미지';
  ELSIF p_message_type = 'file' THEN
    v_preview := '📎 파일';
  ELSE
    v_preview := LEFT(p_content, 100);
  END IF;

  -- Update conversation
  UPDATE public.conversations
  SET
    last_message_at = NOW(),
    last_message_preview = v_preview
  WHERE id = p_conversation_id;

  -- Auto-read own message
  INSERT INTO public.message_reads (message_id, user_id)
  VALUES (v_message_id, p_sender_id);

  -- Create notifications for other participants
  INSERT INTO public.notifications (user_id, type, title, content, link)
  SELECT
    cp.user_id,
    'message',
    '새 메시지',
    v_preview,
    '/messages/' || p_conversation_id
  FROM public.conversation_participants cp
  WHERE cp.conversation_id = p_conversation_id
    AND cp.user_id != p_sender_id
    AND cp.left_at IS NULL
    AND cp.is_muted = false;

  RETURN v_message_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark messages as read
CREATE OR REPLACE FUNCTION mark_messages_read(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS void AS $$
BEGIN
  -- Insert read receipts for all unread messages
  INSERT INTO public.message_reads (message_id, user_id)
  SELECT m.id, p_user_id
  FROM public.messages m
  WHERE m.conversation_id = p_conversation_id
    AND m.sender_id != p_user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.message_reads mr
      WHERE mr.message_id = m.id AND mr.user_id = p_user_id
    )
  ON CONFLICT (message_id, user_id) DO NOTHING;

  -- Update participant's last_read_at
  UPDATE public.conversation_participants
  SET last_read_at = NOW()
  WHERE conversation_id = p_conversation_id AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread message count
CREATE OR REPLACE FUNCTION get_unread_message_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM public.messages m
  JOIN public.conversation_participants cp ON cp.conversation_id = m.conversation_id
  WHERE cp.user_id = p_user_id
    AND cp.left_at IS NULL
    AND m.sender_id != p_user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.message_reads mr
      WHERE mr.message_id = m.id AND mr.user_id = p_user_id
    );

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user presence
CREATE OR REPLACE FUNCTION update_user_presence(
  p_user_id UUID,
  p_status TEXT,
  p_conversation_id UUID DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_presence (user_id, status, last_seen_at, current_conversation_id)
  VALUES (p_user_id, p_status, NOW(), p_conversation_id)
  ON CONFLICT (user_id) DO UPDATE
  SET
    status = p_status,
    last_seen_at = NOW(),
    current_conversation_id = p_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search messages
CREATE OR REPLACE FUNCTION search_messages(
  p_user_id UUID,
  p_query TEXT,
  p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
  message_id UUID,
  conversation_id UUID,
  content TEXT,
  sender_nickname TEXT,
  created_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    m.id,
    m.conversation_id,
    m.content,
    u.nickname,
    m.created_at
  FROM public.messages m
  JOIN public.users u ON u.id = m.sender_id
  JOIN public.conversation_participants cp ON cp.conversation_id = m.conversation_id
  WHERE cp.user_id = p_user_id
    AND cp.left_at IS NULL
    AND m.is_deleted = false
    AND m.content ILIKE '%' || p_query || '%'
  ORDER BY m.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
