-- Enable Realtime for notifications table
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Create function to auto-create notifications
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_content TEXT,
  p_link TEXT DEFAULT NULL,
  p_related_id UUID DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO public.notifications (
    user_id,
    type,
    title,
    content,
    link,
    related_id
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_content,
    p_link,
    p_related_id
  )
  RETURNING id INTO v_notification_id;

  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to notify question author when answer is created
CREATE OR REPLACE FUNCTION notify_question_author_on_answer()
RETURNS TRIGGER AS $$
DECLARE
  v_question public.questions%ROWTYPE;
BEGIN
  -- Get question details
  SELECT * INTO v_question
  FROM public.questions
  WHERE id = NEW.question_id;

  -- Don't notify if author is answering their own question
  IF v_question.author_id != NEW.author_id THEN
    -- Create notification
    PERFORM create_notification(
      v_question.author_id,
      'answer',
      '새로운 답변이 등록되었습니다',
      NEW.author_nickname || '님이 "' || v_question.title || '"에 답변했습니다.',
      '/question/' || v_question.id,
      NEW.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to notify answer author when their answer is accepted
CREATE OR REPLACE FUNCTION notify_answer_accepted()
RETURNS TRIGGER AS $$
DECLARE
  v_answer public.answers%ROWTYPE;
  v_question public.questions%ROWTYPE;
BEGIN
  -- Only trigger when is_accepted changes from false to true
  IF NEW.is_accepted = true AND (OLD.is_accepted IS NULL OR OLD.is_accepted = false) THEN
    -- Get answer details
    SELECT * INTO v_answer FROM public.answers WHERE id = NEW.id;

    -- Get question details
    SELECT * INTO v_question FROM public.questions WHERE id = v_answer.question_id;

    -- Notify answer author
    PERFORM create_notification(
      v_answer.author_id,
      'accepted',
      '답변이 채택되었습니다!',
      '"' || v_question.title || '"에 대한 답변이 채택되었습니다. 코인을 받으세요!',
      '/question/' || v_question.id,
      v_answer.id
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to notify on new message
CREATE OR REPLACE FUNCTION notify_on_new_message()
RETURNS TRIGGER AS $$
DECLARE
  v_conversation public.conversations%ROWTYPE;
  v_recipient_id UUID;
BEGIN
  -- Get conversation details
  SELECT * INTO v_conversation
  FROM public.conversations
  WHERE id = NEW.conversation_id;

  -- Determine recipient (the other user in conversation)
  IF v_conversation.user1_id = NEW.sender_id THEN
    v_recipient_id := v_conversation.user2_id;
  ELSE
    v_recipient_id := v_conversation.user1_id;
  END IF;

  -- Create notification
  PERFORM create_notification(
    v_recipient_id,
    'message',
    '새 메시지가 도착했습니다',
    NEW.sender_nickname || '님으로부터 메시지가 도착했습니다.',
    '/messages/' || v_conversation.id,
    NEW.id
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS answer_notification_trigger ON public.answers;
CREATE TRIGGER answer_notification_trigger
  AFTER INSERT ON public.answers
  FOR EACH ROW
  EXECUTE FUNCTION notify_question_author_on_answer();

DROP TRIGGER IF EXISTS answer_accepted_notification_trigger ON public.answers;
CREATE TRIGGER answer_accepted_notification_trigger
  AFTER UPDATE OF is_accepted ON public.answers
  FOR EACH ROW
  EXECUTE FUNCTION notify_answer_accepted();

DROP TRIGGER IF EXISTS message_notification_trigger ON public.messages;
CREATE TRIGGER message_notification_trigger
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_on_new_message();

-- Add index for better realtime performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON public.notifications(user_id, is_read, created_at DESC)
  WHERE is_read = false;

-- Add index for recent notifications
CREATE INDEX IF NOT EXISTS idx_notifications_recent
  ON public.notifications(user_id, created_at DESC)
  LIMIT 1000;
