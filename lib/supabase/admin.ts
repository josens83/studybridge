import { getSupabase } from './client';

export interface PlatformStats {
  total_students: number;
  total_tutors: number;
  total_admins: number;
  new_users_week: number;
  new_users_month: number;
  total_questions: number;
  questions_week: number;
  total_answers: number;
  answers_week: number;
  accepted_answers: number;
  total_conversations: number;
  messages_week: number;
  notifications_week: number;
  errors_24h: number;
  critical_errors_24h: number;
  pending_reports: number;
  reports_week: number;
  total_coins_in_circulation: number;
  total_points_in_circulation: number;
  last_updated: string;
}

export interface RecentActivity {
  activity_type: 'question' | 'answer' | 'user_registration';
  activity_id: string;
  activity_title: string;
  user_id: string;
  user_nickname: string;
  created_at: string;
}

export interface ErrorSummary {
  date: string;
  total_errors: number;
  critical_errors: number;
  high_errors: number;
  medium_errors: number;
  low_errors: number;
  unique_users: number;
}

/**
 * Check if current user is admin
 */
export async function isAdmin(userId: string): Promise<boolean> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('users').select('role').eq('id', userId).single();
  if (error || !data) return false;
  return data.role === 'admin';
}

/**
 * Get platform statistics
 */
export async function getPlatformStats(): Promise<PlatformStats | null> {
  const supabase = getSupabase();
  const { data, error } = await supabase.from('admin_platform_stats').select('*').single();
  if (error) {
    console.error('Error fetching platform stats:', error);
    return null;
  }
  return data;
}

/**
 * Refresh platform statistics
 */
export async function refreshPlatformStats(): Promise<boolean> {
  const supabase = getSupabase();
  const { error } = await supabase.rpc('refresh_admin_stats');
  if (error) {
    console.error('Error refreshing platform stats:', error);
    return false;
  }
  return true;
}

/**
 * Get error logs
 */
export async function getErrorLogs(page: number = 1, pageSize: number = 50): Promise<{ data: any[]; total: number }> {
  const supabase = getSupabase();
  const { data, error, count } = await supabase
    .from('error_logs')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);
  if (error) {
    console.error('Error fetching error logs:', error);
    return { data: [], total: 0 };
  }
  return { data: data || [], total: count || 0 };
}

/**
 * Toggle user ban status
 */
export async function toggleUserBan(userId: string, adminId: string, banReason?: string): Promise<boolean> {
  const supabase = getSupabase();
  const { data, error } = await supabase.rpc('admin_toggle_user_ban', {
    p_user_id: userId,
    p_admin_id: adminId,
    p_ban_reason: banReason,
  });
  if (error) {
    console.error('Error toggling user ban:', error);
    throw new Error(error.message);
  }
  return data;
}
