-- Admin dashboard views and functions

-- Create materialized view for platform statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS admin_platform_stats AS
SELECT
  -- User statistics
  (SELECT COUNT(*) FROM public.users WHERE role = 'student') as total_students,
  (SELECT COUNT(*) FROM public.users WHERE role = 'tutor') as total_tutors,
  (SELECT COUNT(*) FROM public.users WHERE role = 'admin') as total_admins,
  (SELECT COUNT(*) FROM public.users WHERE created_at > NOW() - INTERVAL '7 days') as new_users_week,
  (SELECT COUNT(*) FROM public.users WHERE created_at > NOW() - INTERVAL '30 days') as new_users_month,

  -- Content statistics
  (SELECT COUNT(*) FROM public.questions) as total_questions,
  (SELECT COUNT(*) FROM public.questions WHERE created_at > NOW() - INTERVAL '7 days') as questions_week,
  (SELECT COUNT(*) FROM public.answers) as total_answers,
  (SELECT COUNT(*) FROM public.answers WHERE created_at > NOW() - INTERVAL '7 days') as answers_week,
  (SELECT COUNT(*) FROM public.answers WHERE is_accepted = true) as accepted_answers,

  -- Engagement statistics
  (SELECT COUNT(*) FROM public.conversations) as total_conversations,
  (SELECT COUNT(*) FROM public.messages WHERE created_at > NOW() - INTERVAL '7 days') as messages_week,
  (SELECT COUNT(*) FROM public.notifications WHERE created_at > NOW() - INTERVAL '7 days') as notifications_week,

  -- Error statistics
  (SELECT COUNT(*) FROM public.error_logs WHERE created_at > NOW() - INTERVAL '24 hours') as errors_24h,
  (SELECT COUNT(*) FROM public.error_logs WHERE severity = 'critical' AND created_at > NOW() - INTERVAL '24 hours') as critical_errors_24h,

  -- Report statistics
  (SELECT COUNT(*) FROM public.reports WHERE status = 'pending') as pending_reports,
  (SELECT COUNT(*) FROM public.reports WHERE created_at > NOW() - INTERVAL '7 days') as reports_week,

  -- Revenue statistics (coins/points)
  (SELECT COALESCE(SUM(coins), 0) FROM public.users) as total_coins_in_circulation,
  (SELECT COALESCE(SUM(points), 0) FROM public.users) as total_points_in_circulation,

  NOW() as last_updated;

-- Create index for refresh performance
CREATE UNIQUE INDEX IF NOT EXISTS admin_platform_stats_unique ON admin_platform_stats(last_updated);

-- Function to refresh platform stats
CREATE OR REPLACE FUNCTION refresh_admin_stats()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY admin_platform_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for recent activities (for activity log)
CREATE OR REPLACE VIEW admin_recent_activities AS
SELECT
  'question' as activity_type,
  q.id as activity_id,
  q.title as activity_title,
  q.author_id as user_id,
  u.nickname as user_nickname,
  q.created_at
FROM public.questions q
JOIN public.users u ON q.author_id = u.id
WHERE q.created_at > NOW() - INTERVAL '7 days'

UNION ALL

SELECT
  'answer' as activity_type,
  a.id as activity_id,
  'Answer to: ' || q.title as activity_title,
  a.author_id as user_id,
  u.nickname as user_nickname,
  a.created_at
FROM public.answers a
JOIN public.users u ON a.author_id = u.id
JOIN public.questions q ON a.question_id = q.id
WHERE a.created_at > NOW() - INTERVAL '7 days'

UNION ALL

SELECT
  'user_registration' as activity_type,
  u.id as activity_id,
  'New user: ' || u.nickname as activity_title,
  u.id as user_id,
  u.nickname as user_nickname,
  u.created_at
FROM public.users u
WHERE u.created_at > NOW() - INTERVAL '7 days'

ORDER BY created_at DESC
LIMIT 100;

-- Create function to get user details for admin
CREATE OR REPLACE FUNCTION admin_get_user_details(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'user', row_to_json(u),
    'stats', json_build_object(
      'total_questions', (SELECT COUNT(*) FROM public.questions WHERE author_id = p_user_id),
      'total_answers', (SELECT COUNT(*) FROM public.answers WHERE author_id = p_user_id),
      'accepted_answers', (SELECT COUNT(*) FROM public.answers WHERE author_id = p_user_id AND is_accepted = true),
      'total_reports_made', (SELECT COUNT(*) FROM public.reports WHERE reporter_id = p_user_id),
      'total_reports_received', (SELECT COUNT(*) FROM public.reports WHERE reported_user_id = p_user_id),
      'account_age_days', EXTRACT(DAY FROM NOW() - u.created_at)
    ),
    'recent_questions', (
      SELECT json_agg(q ORDER BY q.created_at DESC)
      FROM (SELECT * FROM public.questions WHERE author_id = p_user_id ORDER BY created_at DESC LIMIT 5) q
    ),
    'recent_answers', (
      SELECT json_agg(a ORDER BY a.created_at DESC)
      FROM (SELECT * FROM public.answers WHERE author_id = p_user_id ORDER BY created_at DESC LIMIT 5) a
    )
  ) INTO v_result
  FROM public.users u
  WHERE u.id = p_user_id;

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to ban/unban user
CREATE OR REPLACE FUNCTION admin_toggle_user_ban(
  p_user_id UUID,
  p_admin_id UUID,
  p_ban_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_is_banned BOOLEAN;
BEGIN
  -- Check if admin
  IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = p_admin_id AND role = 'admin') THEN
    RAISE EXCEPTION 'Unauthorized: Only admins can ban users';
  END IF;

  -- Toggle ban status
  UPDATE public.users
  SET
    is_banned = NOT is_banned,
    ban_reason = CASE WHEN NOT is_banned THEN p_ban_reason ELSE NULL END,
    banned_at = CASE WHEN NOT is_banned THEN NOW() ELSE NULL END,
    banned_by = CASE WHEN NOT is_banned THEN p_admin_id ELSE NULL END
  WHERE id = p_user_id
  RETURNING is_banned INTO v_is_banned;

  RETURN v_is_banned;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add ban-related columns to users table if not exist
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS ban_reason TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS banned_at TIMESTAMPTZ;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS banned_by UUID REFERENCES public.users(id);

-- Create index for banned users
CREATE INDEX IF NOT EXISTS idx_users_is_banned ON public.users(is_banned) WHERE is_banned = true;

-- Function to get error log summary
CREATE OR REPLACE FUNCTION admin_get_error_summary(p_days INTEGER DEFAULT 7)
RETURNS TABLE (
  date DATE,
  total_errors INTEGER,
  critical_errors INTEGER,
  high_errors INTEGER,
  medium_errors INTEGER,
  low_errors INTEGER,
  unique_users INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE(el.created_at) as date,
    COUNT(*)::INTEGER as total_errors,
    COUNT(*) FILTER (WHERE el.severity = 'critical')::INTEGER as critical_errors,
    COUNT(*) FILTER (WHERE el.severity = 'high')::INTEGER as high_errors,
    COUNT(*) FILTER (WHERE el.severity = 'medium')::INTEGER as medium_errors,
    COUNT(*) FILTER (WHERE el.severity = 'low')::INTEGER as low_errors,
    COUNT(DISTINCT el.user_id)::INTEGER as unique_users
  FROM public.error_logs el
  WHERE el.created_at > NOW() - (p_days || ' days')::INTERVAL
  GROUP BY DATE(el.created_at)
  ORDER BY date DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to admins
GRANT EXECUTE ON FUNCTION refresh_admin_stats() TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_user_details(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_toggle_user_ban(UUID, UUID, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION admin_get_error_summary(INTEGER) TO authenticated;

-- Grant select on views to authenticated users (RLS will handle admin-only access)
GRANT SELECT ON admin_platform_stats TO authenticated;
GRANT SELECT ON admin_recent_activities TO authenticated;
