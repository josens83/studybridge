-- Add gamification columns to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS experience INTEGER NOT NULL DEFAULT 0;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS level INTEGER NOT NULL DEFAULT 1;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS title TEXT;

-- Create badges table
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT NOT NULL, -- Icon name or emoji
  category TEXT NOT NULL CHECK (category IN ('questions', 'answers', 'quality', 'engagement', 'special')),
  requirement_type TEXT NOT NULL CHECK (requirement_type IN ('count', 'streak', 'quality', 'milestone')),
  requirement_value INTEGER NOT NULL,
  rarity TEXT NOT NULL DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  reward_points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create user_badges junction table
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Create user_stats table for detailed tracking
CREATE TABLE IF NOT EXISTS public.user_stats (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  total_questions INTEGER NOT NULL DEFAULT 0,
  total_answers INTEGER NOT NULL DEFAULT 0,
  best_answers INTEGER NOT NULL DEFAULT 0,
  helpful_votes INTEGER NOT NULL DEFAULT 0,
  questions_streak INTEGER NOT NULL DEFAULT 0,
  answers_streak INTEGER NOT NULL DEFAULT 0,
  last_question_date DATE,
  last_answer_date DATE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_users_experience ON public.users(experience DESC);
CREATE INDEX IF NOT EXISTS idx_users_level ON public.users(level DESC);
CREATE INDEX IF NOT EXISTS idx_user_badges_user ON public.user_badges(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badges_badge ON public.user_badges(badge_id);
CREATE INDEX IF NOT EXISTS idx_badges_category ON public.badges(category);

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- RLS policies for badges (everyone can view)
CREATE POLICY "Everyone can view badges" ON public.badges FOR SELECT USING (true);

-- RLS policies for user_badges
CREATE POLICY "Everyone can view user badges" ON public.user_badges FOR SELECT USING (true);
CREATE POLICY "System can insert user badges" ON public.user_badges FOR INSERT WITH CHECK (true);

-- RLS policies for user_stats
CREATE POLICY "Everyone can view user stats" ON public.user_stats FOR SELECT USING (true);
CREATE POLICY "Users can view own stats" ON public.user_stats FOR SELECT USING (auth.uid() = user_id);

-- Function to calculate level from experience
CREATE OR REPLACE FUNCTION calculate_level(exp INTEGER)
RETURNS INTEGER AS $$
BEGIN
  -- Level = sqrt(experience / 100)
  -- Level 1: 0-99 exp
  -- Level 2: 100-399 exp
  -- Level 3: 400-899 exp
  -- Level 4: 900-1599 exp
  -- etc.
  RETURN GREATEST(1, FLOOR(SQRT(exp / 100.0)) + 1);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function to add experience to user
CREATE OR REPLACE FUNCTION add_experience(
  p_user_id UUID,
  p_amount INTEGER,
  p_reason TEXT DEFAULT NULL
)
RETURNS void AS $$
DECLARE
  v_new_exp INTEGER;
  v_old_level INTEGER;
  v_new_level INTEGER;
BEGIN
  -- Update user experience
  UPDATE public.users
  SET
    experience = experience + p_amount,
    level = calculate_level(experience + p_amount)
  WHERE id = p_user_id
  RETURNING experience - p_amount, level, experience
  INTO v_new_exp, v_new_level, v_new_exp;

  -- Get old level
  SELECT calculate_level(v_new_exp - p_amount) INTO v_old_level;

  -- If level up, create notification
  IF v_new_level > v_old_level THEN
    PERFORM create_notification(
      p_user_id,
      'level_up',
      '레벨 업!',
      '축하합니다! 레벨 ' || v_new_level || '에 도달했습니다.',
      '/profile',
      NULL
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check and award badges
CREATE OR REPLACE FUNCTION check_and_award_badge(
  p_user_id UUID,
  p_badge_slug TEXT
)
RETURNS BOOLEAN AS $$
DECLARE
  v_badge_id UUID;
  v_reward_points INTEGER;
  v_already_has BOOLEAN;
BEGIN
  -- Check if badge exists
  SELECT id, reward_points INTO v_badge_id, v_reward_points
  FROM public.badges
  WHERE slug = p_badge_slug;

  IF v_badge_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Check if user already has badge
  SELECT EXISTS(
    SELECT 1 FROM public.user_badges
    WHERE user_id = p_user_id AND badge_id = v_badge_id
  ) INTO v_already_has;

  IF v_already_has THEN
    RETURN FALSE;
  END IF;

  -- Award badge
  INSERT INTO public.user_badges (user_id, badge_id)
  VALUES (p_user_id, v_badge_id);

  -- Add reward points
  IF v_reward_points > 0 THEN
    UPDATE public.users
    SET points = points + v_reward_points
    WHERE id = p_user_id;
  END IF;

  -- Create notification
  PERFORM create_notification(
    p_user_id,
    'badge_earned',
    '새로운 배지 획득!',
    '축하합니다! "' || (SELECT name FROM public.badges WHERE id = v_badge_id) || '" 배지를 획득했습니다.',
    '/profile',
    v_badge_id
  );

  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update user stats on question creation
CREATE OR REPLACE FUNCTION update_stats_on_question()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update user stats
  INSERT INTO public.user_stats (user_id, total_questions, last_question_date)
  VALUES (NEW.author_id, 1, CURRENT_DATE)
  ON CONFLICT (user_id) DO UPDATE
  SET
    total_questions = user_stats.total_questions + 1,
    last_question_date = CURRENT_DATE,
    questions_streak = CASE
      WHEN user_stats.last_question_date = CURRENT_DATE - INTERVAL '1 day'
      THEN user_stats.questions_streak + 1
      WHEN user_stats.last_question_date = CURRENT_DATE
      THEN user_stats.questions_streak
      ELSE 1
    END,
    updated_at = NOW();

  -- Add experience
  PERFORM add_experience(NEW.author_id, 10, 'question_created');

  -- Check for badges
  PERFORM check_and_award_badge(NEW.author_id, 'first-question')
    WHERE (SELECT total_questions FROM user_stats WHERE user_id = NEW.author_id) = 1;

  PERFORM check_and_award_badge(NEW.author_id, 'curious-mind')
    WHERE (SELECT total_questions FROM user_stats WHERE user_id = NEW.author_id) >= 10;

  PERFORM check_and_award_badge(NEW.author_id, 'question-master')
    WHERE (SELECT total_questions FROM user_stats WHERE user_id = NEW.author_id) >= 100;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update user stats on answer creation
CREATE OR REPLACE FUNCTION update_stats_on_answer()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert or update user stats
  INSERT INTO public.user_stats (user_id, total_answers, last_answer_date)
  VALUES (NEW.author_id, 1, CURRENT_DATE)
  ON CONFLICT (user_id) DO UPDATE
  SET
    total_answers = user_stats.total_answers + 1,
    last_answer_date = CURRENT_DATE,
    answers_streak = CASE
      WHEN user_stats.last_answer_date = CURRENT_DATE - INTERVAL '1 day'
      THEN user_stats.answers_streak + 1
      WHEN user_stats.last_answer_date = CURRENT_DATE
      THEN user_stats.answers_streak
      ELSE 1
    END,
    updated_at = NOW();

  -- Add experience
  PERFORM add_experience(NEW.author_id, 20, 'answer_created');

  -- Check for badges
  PERFORM check_and_award_badge(NEW.author_id, 'helpful-hand')
    WHERE (SELECT total_answers FROM user_stats WHERE user_id = NEW.author_id) = 1;

  PERFORM check_and_award_badge(NEW.author_id, 'answer-machine')
    WHERE (SELECT total_answers FROM user_stats WHERE user_id = NEW.author_id) >= 50;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update stats on answer acceptance
CREATE OR REPLACE FUNCTION update_stats_on_answer_accepted()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_accepted = true AND (OLD.is_accepted IS NULL OR OLD.is_accepted = false) THEN
    -- Update user stats
    UPDATE public.user_stats
    SET
      best_answers = best_answers + 1,
      updated_at = NOW()
    WHERE user_id = NEW.author_id;

    -- Add experience
    PERFORM add_experience(NEW.author_id, 50, 'answer_accepted');

    -- Check for badges
    PERFORM check_and_award_badge(NEW.author_id, 'first-best-answer')
      WHERE (SELECT best_answers FROM user_stats WHERE user_id = NEW.author_id) = 1;

    PERFORM check_and_award_badge(NEW.author_id, 'expert')
      WHERE (SELECT best_answers FROM user_stats WHERE user_id = NEW.author_id) >= 25;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
DROP TRIGGER IF EXISTS question_stats_trigger ON public.questions;
CREATE TRIGGER question_stats_trigger
  AFTER INSERT ON public.questions
  FOR EACH ROW
  EXECUTE FUNCTION update_stats_on_question();

DROP TRIGGER IF EXISTS answer_stats_trigger ON public.answers;
CREATE TRIGGER answer_stats_trigger
  AFTER INSERT ON public.answers
  FOR EACH ROW
  EXECUTE FUNCTION update_stats_on_answer();

DROP TRIGGER IF EXISTS answer_accepted_stats_trigger ON public.answers;
CREATE TRIGGER answer_accepted_stats_trigger
  AFTER UPDATE OF is_accepted ON public.answers
  FOR EACH ROW
  EXECUTE FUNCTION update_stats_on_answer_accepted();

-- Insert default badges
INSERT INTO public.badges (name, slug, description, icon, category, requirement_type, requirement_value, rarity, reward_points) VALUES
  -- Question badges
  ('첫 질문', 'first-question', '첫 질문을 작성했습니다', '🎓', 'questions', 'count', 1, 'common', 10),
  ('호기심 많은 학생', 'curious-mind', '질문 10개를 작성했습니다', '🤔', 'questions', 'count', 10, 'rare', 50),
  ('질문 마스터', 'question-master', '질문 100개를 작성했습니다', '📚', 'questions', 'count', 100, 'epic', 200),

  -- Answer badges
  ('도움의 손길', 'helpful-hand', '첫 답변을 작성했습니다', '👋', 'answers', 'count', 1, 'common', 10),
  ('답변 기계', 'answer-machine', '답변 50개를 작성했습니다', '⚙️', 'answers', 'count', 50, 'rare', 100),

  -- Quality badges
  ('첫 채택', 'first-best-answer', '첫 답변이 채택되었습니다', '⭐', 'quality', 'count', 1, 'common', 25),
  ('전문가', 'expert', '25개의 답변이 채택되었습니다', '🏆', 'quality', 'count', 25, 'epic', 250),
  ('구루', 'guru', '100개의 답변이 채택되었습니다', '👑', 'quality', 'count', 100, 'legendary', 1000),

  -- Engagement badges
  ('활발한 참여자', 'active-member', '7일 연속 활동했습니다', '🔥', 'engagement', 'streak', 7, 'rare', 75),
  ('헌신적인 멤버', 'dedicated-member', '30일 연속 활동했습니다', '💎', 'engagement', 'streak', 30, 'epic', 300),

  -- Special badges
  ('얼리버드', 'early-bird', '서비스 초기 가입자', '🐦', 'special', 'milestone', 1, 'rare', 50)
ON CONFLICT (slug) DO NOTHING;

-- Create materialized view for leaderboard
CREATE MATERIALIZED VIEW IF NOT EXISTS leaderboard AS
SELECT
  u.id,
  u.nickname,
  u.level,
  u.experience,
  u.points,
  COALESCE(s.total_questions, 0) as total_questions,
  COALESCE(s.total_answers, 0) as total_answers,
  COALESCE(s.best_answers, 0) as best_answers,
  COUNT(DISTINCT ub.badge_id) as badge_count,
  ROW_NUMBER() OVER (ORDER BY u.experience DESC) as rank
FROM public.users u
LEFT JOIN public.user_stats s ON u.id = s.user_id
LEFT JOIN public.user_badges ub ON u.id = ub.user_id
WHERE u.is_anonymous = false
GROUP BY u.id, u.nickname, u.level, u.experience, u.points, s.total_questions, s.total_answers, s.best_answers
ORDER BY u.experience DESC
LIMIT 100;

-- Create index on leaderboard
CREATE UNIQUE INDEX IF NOT EXISTS idx_leaderboard_id ON leaderboard(id);

-- Function to refresh leaderboard
CREATE OR REPLACE FUNCTION refresh_leaderboard()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY leaderboard;
END;
$$ LANGUAGE plpgsql;
