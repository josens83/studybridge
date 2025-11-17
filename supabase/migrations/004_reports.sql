-- =====================================================
-- 004_reports.sql
-- Report system for content moderation
-- =====================================================

-- Reports table
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reported_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL CHECK (content_type IN ('question', 'answer', 'user')),
  content_id UUID NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN (
    'spam',
    'inappropriate',
    'harassment',
    'copyright',
    'false_information',
    'other'
  )),
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  admin_notes TEXT,
  resolved_by UUID REFERENCES public.users(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_reports_reporter ON public.reports(reporter_id);
CREATE INDEX idx_reports_reported_user ON public.reports(reported_user_id);
CREATE INDEX idx_reports_content ON public.reports(content_type, content_id);
CREATE INDEX idx_reports_status ON public.reports(status);

-- RLS policies
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Users can view their own reports
CREATE POLICY "Users can view their own reports"
  ON public.reports
  FOR SELECT
  USING (auth.uid() = reporter_id);

-- Users can create reports
CREATE POLICY "Users can create reports"
  ON public.reports
  FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- Admins can view all reports
CREATE POLICY "Admins can view all reports"
  ON public.reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Admins can update reports
CREATE POLICY "Admins can update reports"
  ON public.reports
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Update timestamp trigger
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Blocked users table
CREATE TABLE IF NOT EXISTS public.blocked_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, blocked_user_id)
);

-- Indexes
CREATE INDEX idx_blocked_users_user ON public.blocked_users(user_id);
CREATE INDEX idx_blocked_users_blocked ON public.blocked_users(blocked_user_id);

-- RLS policies
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- Users can view their own blocked users list
CREATE POLICY "Users can view their blocked list"
  ON public.blocked_users
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can block other users
CREATE POLICY "Users can block others"
  ON public.blocked_users
  FOR INSERT
  WITH CHECK (auth.uid() = user_id AND user_id != blocked_user_id);

-- Users can unblock users
CREATE POLICY "Users can unblock others"
  ON public.blocked_users
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to check if user is blocked
CREATE OR REPLACE FUNCTION is_user_blocked(
  p_user_id UUID,
  p_blocked_user_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.blocked_users
    WHERE user_id = p_user_id
    AND blocked_user_id = p_blocked_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.reports TO authenticated;
GRANT ALL ON public.blocked_users TO authenticated;
GRANT EXECUTE ON FUNCTION is_user_blocked TO authenticated;

COMMENT ON TABLE public.reports IS 'User reports for content moderation';
COMMENT ON TABLE public.blocked_users IS 'User blocking system';
