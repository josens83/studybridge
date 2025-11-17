import { supabase } from './client';

// 관리자 권한 확인
export async function isAdmin(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();

  if (error || !data) return false;
  return data.role === 'admin';
}

// 신고 관리
export interface Report {
  id: string;
  reporter_id: string;
  reporter_nickname: string;
  reported_user_id: string;
  reported_user_nickname: string;
  content_type: 'question' | 'answer' | 'user';
  content_id: string;
  reason: string;
  description: string;
  status: 'pending' | 'reviewing' | 'resolved' | 'dismissed';
  admin_note: string | null;
  created_at: string;
}

export async function getReports(status?: string) {
  let query = supabase
    .from('reports')
    .select(`
      *,
      reporter:users!reports_reporter_id_fkey(nickname),
      reported_user:users!reports_reported_user_id_fkey(nickname)
    `)
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;

  if (error) throw error;

  // 데이터 변환
  return (data || []).map((report: any) => ({
    ...report,
    reporter_nickname: report.reporter?.nickname || '알 수 없음',
    reported_user_nickname: report.reported_user?.nickname || '알 수 없음',
  }));
}

export async function updateReportStatus(
  reportId: string,
  status: 'reviewing' | 'resolved' | 'dismissed',
  adminNote?: string
) {
  const { error } = await supabase
    .from('reports')
    .update({
      status,
      admin_note: adminNote,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', reportId);

  if (error) throw error;
}

// 사용자 관리
export interface AdminUser {
  id: string;
  email: string;
  nickname: string;
  role: 'student' | 'tutor' | 'admin';
  coins: number;
  points: number;
  subscription_tier: string;
  created_at: string;
  is_blocked: boolean;
}

export async function getAllUsers(page = 1, limit = 50, search?: string) {
  let query = supabase
    .from('users')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (search) {
    query = query.or(`nickname.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data, error, count } = await query;

  if (error) throw error;

  // blocked_users 테이블에서 차단 여부 확인
  const userIds = data?.map((u) => u.id) || [];
  const { data: blockedData } = await supabase
    .from('blocked_users')
    .select('user_id')
    .in('user_id', userIds);

  const blockedSet = new Set(blockedData?.map((b) => b.user_id) || []);

  const users = (data || []).map((user) => ({
    ...user,
    is_blocked: blockedSet.has(user.id),
  }));

  return { users, total: count || 0 };
}

export async function updateUserRole(userId: string, role: 'student' | 'tutor' | 'admin') {
  const { error } = await supabase
    .from('users')
    .update({ role })
    .eq('id', userId);

  if (error) throw error;
}

export async function blockUser(userId: string, reason: string, blockedBy: string) {
  const { error } = await supabase
    .from('blocked_users')
    .insert({
      user_id: userId,
      reason,
      blocked_by: blockedBy,
    });

  if (error) throw error;
}

export async function unblockUser(userId: string) {
  const { error } = await supabase
    .from('blocked_users')
    .delete()
    .eq('user_id', userId);

  if (error) throw error;
}

// 질문/답변 관리
export async function deleteQuestion(questionId: string) {
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', questionId);

  if (error) throw error;
}

export async function deleteAnswer(answerId: string) {
  const { error } = await supabase
    .from('answers')
    .delete()
    .eq('id', answerId);

  if (error) throw error;
}

// 통계
export interface AdminStats {
  totalUsers: number;
  totalQuestions: number;
  totalAnswers: number;
  totalReports: number;
  pendingReports: number;
  totalRevenue: number;
  newUsersToday: number;
  questionsToday: number;
}

export async function getAdminStats(): Promise<AdminStats> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 총 사용자 수
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  // 총 질문 수
  const { count: totalQuestions } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true });

  // 총 답변 수
  const { count: totalAnswers } = await supabase
    .from('answers')
    .select('*', { count: 'exact', head: true });

  // 총 신고 수
  const { count: totalReports } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true });

  // 대기 중 신고 수
  const { count: pendingReports } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  // 오늘 가입한 사용자
  const { count: newUsersToday } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString());

  // 오늘 등록된 질문
  const { count: questionsToday } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString());

  // 총 매출 (완료된 결제)
  const { data: payments } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'completed');

  const totalRevenue = payments?.reduce((sum, p) => sum + p.amount, 0) || 0;

  return {
    totalUsers: totalUsers || 0,
    totalQuestions: totalQuestions || 0,
    totalAnswers: totalAnswers || 0,
    totalReports: totalReports || 0,
    pendingReports: pendingReports || 0,
    totalRevenue,
    newUsersToday: newUsersToday || 0,
    questionsToday: questionsToday || 0,
  };
}

// 최근 활동
export interface RecentActivity {
  id: string;
  type: 'question' | 'answer' | 'payment' | 'report';
  user_nickname: string;
  description: string;
  created_at: string;
}

export async function getRecentActivities(limit = 10): Promise<RecentActivity[]> {
  const activities: RecentActivity[] = [];

  // 최근 질문
  const { data: questions } = await supabase
    .from('questions')
    .select('id, author_nickname, title, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);

  questions?.forEach((q) => {
    activities.push({
      id: q.id,
      type: 'question',
      user_nickname: q.author_nickname,
      description: `질문: ${q.title}`,
      created_at: q.created_at,
    });
  });

  // 최근 신고
  const { data: reports } = await supabase
    .from('reports')
    .select(`
      id,
      reason,
      created_at,
      reporter:users!reports_reporter_id_fkey(nickname)
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  reports?.forEach((r: any) => {
    activities.push({
      id: r.id,
      type: 'report',
      user_nickname: r.reporter?.nickname || '알 수 없음',
      description: `신고: ${r.reason}`,
      created_at: r.created_at,
    });
  });

  // 시간순 정렬
  activities.sort((a, b) =>
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return activities.slice(0, limit);
}
