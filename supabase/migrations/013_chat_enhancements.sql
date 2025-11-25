-- Chat system enhancements migration
-- Adds file attachment support to messages and updates send_message function

-- Update send_message function to support file attachments
CREATE OR REPLACE FUNCTION send_message(
  p_conversation_id UUID,
  p_sender_id UUID,
  p_content TEXT,
  p_message_type TEXT DEFAULT 'text',
  p_image_urls TEXT[] DEFAULT '{}',
  p_file_url TEXT DEFAULT NULL,
  p_file_name TEXT DEFAULT NULL,
  p_file_size INTEGER DEFAULT NULL,
  p_reply_to_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_message_id UUID;
  v_preview TEXT;
BEGIN
  -- Insert message with file support
  INSERT INTO public.messages (
    conversation_id, sender_id, content, message_type, image_urls,
    file_url, file_name, file_size, reply_to_id
  )
  VALUES (
    p_conversation_id, p_sender_id, p_content, p_message_type, p_image_urls,
    p_file_url, p_file_name, p_file_size, p_reply_to_id
  )
  RETURNING id INTO v_message_id;

  -- Create preview text
  IF p_message_type = 'image' THEN
    v_preview := '📷 이미지';
  ELSIF p_message_type = 'file' THEN
    v_preview := '📎 ' || COALESCE(p_file_name, '파일');
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

-- Create group conversation function
CREATE OR REPLACE FUNCTION create_group_conversation(
  p_created_by UUID,
  p_title TEXT,
  p_participant_ids UUID[]
)
RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
  v_participant_id UUID;
BEGIN
  -- Create group conversation
  INSERT INTO public.conversations (type, title, created_by)
  VALUES ('group', p_title, p_created_by)
  RETURNING id INTO v_conversation_id;

  -- Add creator as admin
  INSERT INTO public.conversation_participants (conversation_id, user_id, role)
  VALUES (v_conversation_id, p_created_by, 'admin');

  -- Add other participants as members
  FOREACH v_participant_id IN ARRAY p_participant_ids
  LOOP
    IF v_participant_id != p_created_by THEN
      INSERT INTO public.conversation_participants (conversation_id, user_id, role)
      VALUES (v_conversation_id, v_participant_id, 'member')
      ON CONFLICT (conversation_id, user_id) DO NOTHING;
    END IF;
  END LOOP;

  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add participants to existing conversation
CREATE OR REPLACE FUNCTION add_conversation_participants(
  p_conversation_id UUID,
  p_participant_ids UUID[]
)
RETURNS void AS $$
DECLARE
  v_participant_id UUID;
BEGIN
  FOREACH v_participant_id IN ARRAY p_participant_ids
  LOOP
    INSERT INTO public.conversation_participants (conversation_id, user_id, role)
    VALUES (p_conversation_id, v_participant_id, 'member')
    ON CONFLICT (conversation_id, user_id)
    DO UPDATE SET left_at = NULL, joined_at = NOW();
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get conversation participant count
CREATE OR REPLACE FUNCTION get_conversation_participant_count(p_conversation_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM public.conversation_participants
  WHERE conversation_id = p_conversation_id
    AND left_at IS NULL;

  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create index for file messages
CREATE INDEX IF NOT EXISTS idx_messages_file ON public.messages(file_url) WHERE file_url IS NOT NULL;

-- Create storage bucket for chat files (run manually in Supabase dashboard)
-- insert into storage.buckets (id, name, public, file_size_limit)
-- values ('chat-files', 'chat-files', true, 20971520);
