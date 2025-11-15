-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  nickname TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'tutor', 'admin')),
  avatar_url TEXT,
  coins INTEGER NOT NULL DEFAULT 0,
  points INTEGER NOT NULL DEFAULT 0,
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium', 'premium_plus')),
  subscription_expires_at TIMESTAMPTZ,
  is_anonymous BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tier TEXT NOT NULL CHECK (tier IN ('free', 'premium', 'premium_plus')),
  status TEXT NOT NULL CHECK (status IN ('active', 'cancelled', 'expired')),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Questions table
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  author_nickname TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  subject TEXT NOT NULL CHECK (subject IN ('국어', '영어', '수학', '과학', '사회', '역사', '기타')),
  grade_level TEXT NOT NULL CHECK (grade_level IN ('초등학생', '중학생', '고등학생', '대학생')),
  image_urls TEXT[] DEFAULT '{}',
  coins_reward INTEGER NOT NULL DEFAULT 100,
  is_urgent BOOLEAN NOT NULL DEFAULT false,
  is_answered BOOLEAN NOT NULL DEFAULT false,
  accepted_answer_id UUID,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Answers table
CREATE TABLE public.answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  author_nickname TEXT NOT NULL,
  author_role TEXT NOT NULL,
  content TEXT NOT NULL,
  image_urls TEXT[] DEFAULT '{}',
  is_accepted BOOLEAN NOT NULL DEFAULT false,
  upvotes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tutors table
CREATE TABLE public.tutors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  university TEXT NOT NULL,
  major TEXT NOT NULL,
  verification_status TEXT NOT NULL DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  rating DECIMAL(3,2) DEFAULT 0.00,
  total_sessions INTEGER NOT NULL DEFAULT 0,
  specialties TEXT[] NOT NULL,
  hourly_rate INTEGER NOT NULL,
  is_available BOOLEAN NOT NULL DEFAULT true,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Tutoring sessions table
CREATE TABLE public.tutoring_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  tutor_id UUID NOT NULL REFERENCES public.tutors(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  scheduled_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER,
  cost INTEGER NOT NULL,
  rating DECIMAL(3,2),
  feedback TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payments table
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('subscription', 'coins', 'tutoring')),
  amount INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  payment_method TEXT NOT NULL,
  payment_key TEXT,
  order_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Coin transactions table
CREATE TABLE public.coin_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earn', 'spend', 'purchase', 'refund')),
  description TEXT NOT NULL,
  related_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Point transactions table
CREATE TABLE public.point_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earn', 'spend')),
  description TEXT NOT NULL,
  related_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('answer', 'accepted', 'message', 'system')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key for accepted answer
ALTER TABLE public.questions
ADD CONSTRAINT fk_accepted_answer
FOREIGN KEY (accepted_answer_id)
REFERENCES public.answers(id)
ON DELETE SET NULL;

-- Create indexes for better performance
CREATE INDEX idx_questions_author ON public.questions(author_id);
CREATE INDEX idx_questions_subject ON public.questions(subject);
CREATE INDEX idx_questions_created_at ON public.questions(created_at DESC);
CREATE INDEX idx_answers_question ON public.answers(question_id);
CREATE INDEX idx_answers_author ON public.answers(author_id);
CREATE INDEX idx_tutoring_sessions_student ON public.tutoring_sessions(student_id);
CREATE INDEX idx_tutoring_sessions_tutor ON public.tutoring_sessions(tutor_id);
CREATE INDEX idx_notifications_user ON public.notifications(user_id, is_read);
CREATE INDEX idx_coin_transactions_user ON public.coin_transactions(user_id, created_at DESC);
CREATE INDEX idx_point_transactions_user ON public.point_transactions(user_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutoring_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.point_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users: Users can read all, but only update their own
CREATE POLICY "Users can view all users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

-- Questions: Anyone can read, authenticated users can create
CREATE POLICY "Anyone can view questions" ON public.questions FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create questions" ON public.questions FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own questions" ON public.questions FOR UPDATE USING (auth.uid() = author_id);

-- Answers: Anyone can read, authenticated users can create
CREATE POLICY "Anyone can view answers" ON public.answers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create answers" ON public.answers FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authors can update own answers" ON public.answers FOR UPDATE USING (auth.uid() = author_id);

-- Tutors: Anyone can read verified tutors
CREATE POLICY "Anyone can view verified tutors" ON public.tutors FOR SELECT USING (verification_status = 'verified');
CREATE POLICY "Users can create tutor profile" ON public.tutors FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Tutors can update own profile" ON public.tutors FOR UPDATE USING (auth.uid() = user_id);

-- Tutoring sessions: Only participants can view
CREATE POLICY "Participants can view sessions" ON public.tutoring_sessions FOR SELECT
  USING (auth.uid() = student_id OR auth.uid() IN (SELECT user_id FROM public.tutors WHERE id = tutor_id));

-- Payments, transactions: Users can only see their own
CREATE POLICY "Users can view own payments" ON public.payments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own coin transactions" ON public.coin_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own point transactions" ON public.point_transactions FOR SELECT USING (auth.uid() = user_id);

-- Notifications: Users can only see their own
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON public.subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON public.questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_answers_updated_at BEFORE UPDATE ON public.answers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tutors_updated_at BEFORE UPDATE ON public.tutors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_tutoring_sessions_updated_at BEFORE UPDATE ON public.tutoring_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
