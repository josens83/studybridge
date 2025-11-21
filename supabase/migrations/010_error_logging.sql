-- Create error_logs table for client-side error monitoring
CREATE TABLE IF NOT EXISTS public.error_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  error_message TEXT NOT NULL,
  error_stack TEXT,
  component_stack TEXT,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  url TEXT,
  user_agent TEXT,
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  context JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON public.error_logs(severity, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_user ON public.error_logs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON public.error_logs(created_at DESC);

-- Enable RLS
ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies
-- Allow system to insert error logs (no user auth required)
CREATE POLICY "Anyone can insert error logs" ON public.error_logs
  FOR INSERT
  WITH CHECK (true);

-- Only admins can view error logs (for future admin dashboard)
CREATE POLICY "Only admins can view error logs" ON public.error_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Create a function to clean up old error logs (keep last 30 days)
CREATE OR REPLACE FUNCTION cleanup_old_error_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM public.error_logs
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a view for error log summary (useful for monitoring)
CREATE OR REPLACE VIEW error_log_summary AS
SELECT
  DATE(created_at) as date,
  severity,
  COUNT(*) as count,
  COUNT(DISTINCT user_id) as affected_users,
  ARRAY_AGG(DISTINCT error_message) FILTER (WHERE error_message IS NOT NULL) as unique_messages
FROM public.error_logs
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at), severity
ORDER BY date DESC, severity DESC;

-- Grant access to the view for admins
GRANT SELECT ON error_log_summary TO authenticated;
