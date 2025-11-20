import { supabase } from './client';
import type { Question, Answer } from '@/types';

export interface UserStats {
  questions_asked: number;
  answers_provided: number;
  best_answers: number;
  acceptance_rate: number;
}

export interface Activity {
  id: string;
  type: 'question' | 'answer' | 'accepted';
  title: string;
  description: string;
  created_at: string;
}

export interface Transaction {
  id: string;
  type: 'earn' | 'spend' | 'reward';
  description: string;
  amount: number;
  created_at: string;
  currency: 'coins' | 'points';
}

/**
 * Get user statistics for dashboard
 */
export async function getUserStats(userId: string): Promise<UserStats> {
  // Count questions asked
  const { count: questionsCount } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', userId);

  // Count answers provided
  const { count: answersCount } = await supabase
    .from('answers')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', userId);

  // Count accepted answers
  const { count: acceptedCount } = await supabase
    .from('answers')
    .select('*', { count: 'exact', head: true })
    .eq('author_id', userId)
    .eq('is_accepted', true);

  const questions_asked = questionsCount || 0;
  const answers_provided = answersCount || 0;
  const best_answers = acceptedCount || 0;

  // Calculate acceptance rate
  const acceptance_rate = answers_provided > 0
    ? Math.round((best_answers / answers_provided) * 100)
    : 0;

  return {
    questions_asked,
    answers_provided,
    best_answers,
    acceptance_rate,
  };
}

/**
 * Get recent activities (questions asked, answers given, answers accepted)
 */
export async function getRecentActivities(userId: string, limit: number = 10): Promise<Activity[]> {
  const activities: Activity[] = [];

  // Get recent questions
  const { data: questions } = await supabase
    .from('questions')
    .select('id, title, created_at, is_answered')
    .eq('author_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (questions) {
    questions.forEach((q) => {
      activities.push({
        id: q.id,
        type: 'question',
        title: q.title,
        description: q.is_answered ? '답변 완료' : '답변 대기 중',
        created_at: q.created_at,
      });
    });
  }

  // Get recent answers
  const { data: answers } = await supabase
    .from('answers')
    .select(`
      id,
      created_at,
      is_accepted,
      questions!inner(id, title)
    `)
    .eq('author_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (answers) {
    answers.forEach((a: any) => {
      activities.push({
        id: a.id,
        type: a.is_accepted ? 'accepted' : 'answer',
        title: a.questions.title,
        description: a.is_accepted ? '답변이 채택되었습니다' : '답변 완료',
        created_at: a.created_at,
      });
    });
  }

  // Sort by date and limit
  activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return activities.slice(0, limit);
}

/**
 * Get user's questions with details
 */
export async function getUserQuestions(userId: string): Promise<Question[]> {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('author_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user questions:', error);
    throw new Error('질문 목록을 불러올 수 없습니다.');
  }

  return data || [];
}

/**
 * Get user's answers with question details
 */
export async function getUserAnswers(userId: string): Promise<(Answer & { question: Question })[]> {
  const { data, error } = await supabase
    .from('answers')
    .select(`
      *,
      questions(*)
    `)
    .eq('author_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user answers:', error);
    throw new Error('답변 목록을 불러올 수 없습니다.');
  }

  // Transform data to match expected type
  return (data || []).map((item: any) => ({
    ...item,
    question: item.questions,
  }));
}

/**
 * Get coin transactions history
 */
export async function getCoinTransactions(userId: string, limit: number = 20): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('coin_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching coin transactions:', error);
    // Return empty array instead of throwing - table might not have data yet
    return [];
  }

  return (data || []).map((t) => ({
    id: t.id,
    type: t.amount > 0 ? 'earn' : 'spend',
    description: t.description || t.transaction_type,
    amount: t.amount,
    created_at: t.created_at,
    currency: 'coins' as const,
  }));
}

/**
 * Get point transactions history
 */
export async function getPointTransactions(userId: string, limit: number = 20): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('point_transactions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching point transactions:', error);
    // Return empty array instead of throwing - table might not have data yet
    return [];
  }

  return (data || []).map((t) => ({
    id: t.id,
    type: 'reward',
    description: t.description || t.transaction_type,
    amount: t.amount,
    created_at: t.created_at,
    currency: 'points' as const,
  }));
}

/**
 * Get all transactions (coins + points) combined
 */
export async function getAllTransactions(userId: string, limit: number = 20): Promise<Transaction[]> {
  const [coinTransactions, pointTransactions] = await Promise.all([
    getCoinTransactions(userId, limit),
    getPointTransactions(userId, limit),
  ]);

  const allTransactions = [...coinTransactions, ...pointTransactions];
  allTransactions.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return allTransactions.slice(0, limit);
}
