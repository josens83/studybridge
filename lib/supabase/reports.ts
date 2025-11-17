import { supabase } from './client';

export type ReportReason =
  | 'spam'
  | 'inappropriate'
  | 'harassment'
  | 'copyright'
  | 'false_information'
  | 'other';

export type ContentType = 'question' | 'answer' | 'user';

export interface ReportData {
  reporter_id: string;
  reported_user_id: string;
  content_type: ContentType;
  content_id: string;
  reason: ReportReason;
  description?: string;
}

/**
 * Report reasons with Korean labels
 */
export const REPORT_REASONS: { value: ReportReason; label: string; description: string }[] = [
  {
    value: 'spam',
    label: '스팸 / 광고',
    description: '상업적 광고, 도배 등',
  },
  {
    value: 'inappropriate',
    label: '부적절한 콘텐츠',
    description: '음란물, 폭력적 내용 등',
  },
  {
    value: 'harassment',
    label: '괴롭힘 / 욕설',
    description: '인신공격, 비방, 욕설 등',
  },
  {
    value: 'copyright',
    label: '저작권 침해',
    description: '무단 복제, 도용 등',
  },
  {
    value: 'false_information',
    label: '허위 정보',
    description: '거짓 정보, 사기 등',
  },
  {
    value: 'other',
    label: '기타',
    description: '위에 해당하지 않는 문제',
  },
];

/**
 * Create a new report
 */
export async function createReport(data: ReportData) {
  const { data: report, error } = await supabase
    .from('reports')
    .insert({
      reporter_id: data.reporter_id,
      reported_user_id: data.reported_user_id,
      content_type: data.content_type,
      content_id: data.content_id,
      reason: data.reason,
      description: data.description,
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating report:', error);
    throw new Error('신고 접수에 실패했습니다.');
  }

  return report;
}

/**
 * Check if user has already reported this content
 */
export async function hasUserReported(
  userId: string,
  contentType: ContentType,
  contentId: string
): Promise<boolean> {
  const { data, error } = await supabase
    .from('reports')
    .select('id')
    .eq('reporter_id', userId)
    .eq('content_type', contentType)
    .eq('content_id', contentId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking report:', error);
  }

  return !!data;
}

/**
 * Block a user
 */
export async function blockUser(userId: string, blockedUserId: string, reason?: string) {
  const { error } = await supabase
    .from('blocked_users')
    .insert({
      user_id: userId,
      blocked_user_id: blockedUserId,
      reason,
    });

  if (error) {
    console.error('Error blocking user:', error);
    throw new Error('사용자 차단에 실패했습니다.');
  }
}

/**
 * Unblock a user
 */
export async function unblockUser(userId: string, blockedUserId: string) {
  const { error } = await supabase
    .from('blocked_users')
    .delete()
    .eq('user_id', userId)
    .eq('blocked_user_id', blockedUserId);

  if (error) {
    console.error('Error unblocking user:', error);
    throw new Error('차단 해제에 실패했습니다.');
  }
}

/**
 * Get blocked users list
 */
export async function getBlockedUsers(userId: string) {
  const { data, error } = await supabase
    .from('blocked_users')
    .select(`
      *,
      blocked_user:users!blocked_users_blocked_user_id_fkey(id, nickname, email)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching blocked users:', error);
    throw new Error('차단 목록을 불러올 수 없습니다.');
  }

  return data || [];
}

/**
 * Check if user is blocked
 */
export async function isUserBlocked(userId: string, blockedUserId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('blocked_users')
    .select('id')
    .eq('user_id', userId)
    .eq('blocked_user_id', blockedUserId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Error checking if blocked:', error);
  }

  return !!data;
}

/**
 * Get user's reports
 */
export async function getUserReports(userId: string) {
  const { data, error } = await supabase
    .from('reports')
    .select('*')
    .eq('reporter_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reports:', error);
    throw new Error('신고 내역을 불러올 수 없습니다.');
  }

  return data || [];
}
