import { getSupabase } from './client';

export interface Badge {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  category: string;
  requirement_type: string;
  requirement_value: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  reward_points: number;
  created_at: string;
}

export interface UserBadge extends Badge {
  earned_at: string;
}

export interface UserStats {
  user_id: string;
  total_questions: number;
  total_answers: number;
  best_answers: number;
  helpful_votes: number;
  questions_streak: number;
  answers_streak: number;
  last_question_date: string | null;
  last_answer_date: string | null;
  updated_at: string;
}

export interface LeaderboardEntry {
  id: string;
  nickname: string;
  level: number;
  experience: number;
  points: number;
  total_questions: number;
  total_answers: number;
  best_answers: number;
  badge_count: number;
  rank: number;
}

/**
 * Get user's badges
 */
export async function getUserBadges(userId: string): Promise<UserBadge[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('user_badges')
    .select(`
      earned_at,
      badges (
        id,
        name,
        slug,
        description,
        icon,
        category,
        requirement_type,
        requirement_value,
        rarity,
        reward_points,
        created_at
      )
    `)
    .eq('user_id', userId)
    .order('earned_at', { ascending: false });

  if (error) {
    console.error('Error fetching user badges:', error);
    return [];
  }

  return (data || []).map((item: any) => ({
    ...item.badges,
    earned_at: item.earned_at,
  }));
}

/**
 * Get all available badges
 */
export async function getAllBadges(): Promise<Badge[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('badges')
    .select('*')
    .order('rarity', { ascending: false });

  if (error) {
    console.error('Error fetching badges:', error);
    return [];
  }

  return data || [];
}

/**
 * Get user stats
 */
export async function getUserStats(userId: string): Promise<UserStats | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('user_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user stats:', error);
    return null;
  }

  return data;
}

/**
 * Get leaderboard
 */
export async function getLeaderboard(limit: number = 100): Promise<LeaderboardEntry[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .limit(limit);

  if (error) {
    console.error('Error fetching leaderboard:', error);
    return [];
  }

  return data || [];
}

/**
 * Get user's rank
 */
export async function getUserRank(userId: string): Promise<number | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('leaderboard')
    .select('rank')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user rank:', error);
    return null;
  }

  return data?.rank || null;
}

/**
 * Calculate experience needed for next level
 */
export function getExpForNextLevel(currentLevel: number): number {
  // Level formula: level = sqrt(exp / 100) + 1
  // Reverse: exp = (level - 1)^2 * 100
  return (currentLevel) * (currentLevel) * 100;
}

/**
 * Get rarity color
 */
export function getRarityColor(rarity: string): string {
  const colors = {
    common: 'text-gray-600 bg-gray-100',
    rare: 'text-blue-600 bg-blue-100',
    epic: 'text-purple-600 bg-purple-100',
    legendary: 'text-yellow-600 bg-yellow-100',
  };
  return colors[rarity as keyof typeof colors] || colors.common;
}

/**
 * Get category icon
 */
export function getCategoryIcon(category: string): string {
  const icons = {
    questions: '❓',
    answers: '💬',
    quality: '⭐',
    engagement: '🔥',
    special: '🎁',
  };
  return icons[category as keyof typeof icons] || '🏅';
}
