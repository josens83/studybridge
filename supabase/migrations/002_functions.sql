-- Database functions for StudyBridge

-- Function to add coins to user
CREATE OR REPLACE FUNCTION add_coins(user_id UUID, amount INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET coins = coins + amount
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deduct coins from user
CREATE OR REPLACE FUNCTION deduct_coins(user_id UUID, amount INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET coins = coins - amount
  WHERE id = user_id AND coins >= amount;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient coins';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to add points to user
CREATE OR REPLACE FUNCTION add_points(user_id UUID, amount INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET points = points + amount
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deduct points from user
CREATE OR REPLACE FUNCTION deduct_points(user_id UUID, amount INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE public.users
  SET points = points - amount
  WHERE id = user_id AND points >= amount;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient points';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to accept answer and transfer coins
CREATE OR REPLACE FUNCTION accept_answer(
  p_question_id UUID,
  p_answer_id UUID,
  p_question_author_id UUID
)
RETURNS void AS $$
DECLARE
  v_coins_reward INTEGER;
  v_answer_author_id UUID;
BEGIN
  -- Get question details
  SELECT coins_reward INTO v_coins_reward
  FROM public.questions
  WHERE id = p_question_id AND author_id = p_question_author_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Question not found or not authorized';
  END IF;

  -- Get answer author
  SELECT author_id INTO v_answer_author_id
  FROM public.answers
  WHERE id = p_answer_id AND question_id = p_question_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Answer not found';
  END IF;

  -- Mark answer as accepted
  UPDATE public.answers
  SET is_accepted = true
  WHERE id = p_answer_id;

  -- Update question
  UPDATE public.questions
  SET is_answered = true, accepted_answer_id = p_answer_id
  WHERE id = p_question_id;

  -- Transfer coins to answer author
  PERFORM add_coins(v_answer_author_id, v_coins_reward);

  -- Record transaction
  INSERT INTO public.coin_transactions (user_id, amount, type, description, related_id)
  VALUES (v_answer_author_id, v_coins_reward, 'earn', '답변 채택 보상', p_answer_id);

  -- Award points (100 points for accepted answer)
  PERFORM add_points(v_answer_author_id, 100);

  INSERT INTO public.point_transactions (user_id, amount, type, description, related_id)
  VALUES (v_answer_author_id, 100, 'earn', '답변 채택 보상', p_answer_id);

  -- Create notification
  INSERT INTO public.notifications (user_id, type, title, content, link)
  VALUES (
    v_answer_author_id,
    'accepted',
    '답변이 채택되었습니다!',
    format('축하합니다! 답변이 채택되어 %s 코인과 100 포인트를 받았습니다.', v_coins_reward),
    format('/question/%s', p_question_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment question views
CREATE OR REPLACE FUNCTION increment_question_views(p_question_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.questions
  SET views = views + 1
  WHERE id = p_question_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to upvote answer
CREATE OR REPLACE FUNCTION upvote_answer(p_answer_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.answers
  SET upvotes = upvotes + 1
  WHERE id = p_answer_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create anonymous user
CREATE OR REPLACE FUNCTION create_anonymous_user()
RETURNS UUID AS $$
DECLARE
  v_user_id UUID;
  v_random_number INTEGER;
  v_nickname TEXT;
BEGIN
  -- Generate random number for nickname
  v_random_number := floor(random() * 9000 + 1000)::INTEGER;
  v_nickname := format('익명%s', v_random_number);

  -- Create user in auth.users (this would be handled by Supabase Auth)
  -- For now, we'll just create in public.users
  INSERT INTO public.users (id, nickname, is_anonymous, coins, points)
  VALUES (gen_random_uuid(), v_nickname, true, 500, 100)
  RETURNING id INTO v_user_id;

  RETURN v_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user stats
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID)
RETURNS TABLE (
  questions_asked INTEGER,
  answers_provided INTEGER,
  best_answers INTEGER,
  total_coins_earned INTEGER,
  total_points_earned INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*)::INTEGER FROM public.questions WHERE author_id = p_user_id),
    (SELECT COUNT(*)::INTEGER FROM public.answers WHERE author_id = p_user_id),
    (SELECT COUNT(*)::INTEGER FROM public.answers WHERE author_id = p_user_id AND is_accepted = true),
    (SELECT COALESCE(SUM(amount), 0)::INTEGER FROM public.coin_transactions WHERE user_id = p_user_id AND type = 'earn'),
    (SELECT COALESCE(SUM(amount), 0)::INTEGER FROM public.point_transactions WHERE user_id = p_user_id AND type = 'earn');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
