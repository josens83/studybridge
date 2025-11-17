import { supabase } from './client';

export interface ProfileUpdate {
  nickname?: string;
  bio?: string;
  avatar_url?: string;
  grade_level?: string;
  subjects_of_interest?: string[];
}

/**
 * Update user profile
 */
export async function updateProfile(userId: string, updates: ProfileUpdate) {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Check if nickname is available
 */
export async function isNicknameAvailable(nickname: string, currentUserId?: string): Promise<boolean> {
  let query = supabase
    .from('users')
    .select('id')
    .eq('nickname', nickname);

  // Exclude current user if provided
  if (currentUserId) {
    query = query.neq('id', currentUserId);
  }

  const { data, error } = await query.single();

  // If no data found, nickname is available
  if (error && error.code === 'PGRST116') {
    return true;
  }

  if (error) throw error;
  return !data; // Available if no user found
}

/**
 * Update user password
 */
export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
  });

  if (error) throw error;
}

/**
 * Get user statistics for profile
 */
export async function getUserStats(userId: string) {
  const [questionsResult, answersResult, acceptedResult, receivedCoinsResult] = await Promise.all([
    // Total questions asked
    supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', userId),

    // Total answers given
    supabase
      .from('answers')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', userId),

    // Accepted answers
    supabase
      .from('answers')
      .select('*', { count: 'exact', head: true })
      .eq('author_id', userId)
      .eq('is_accepted', true),

    // Total coins received from accepted answers
    supabase
      .from('coin_transactions')
      .select('amount')
      .eq('user_id', userId)
      .eq('type', 'answer_accepted'),
  ]);

  const totalQuestions = questionsResult.count || 0;
  const totalAnswers = answersResult.count || 0;
  const acceptedAnswers = acceptedResult.count || 0;
  const acceptanceRate = totalAnswers > 0 ? (acceptedAnswers / totalAnswers) * 100 : 0;

  const coinsEarned = receivedCoinsResult.data?.reduce((sum, tx) => sum + tx.amount, 0) || 0;

  return {
    totalQuestions,
    totalAnswers,
    acceptedAnswers,
    acceptanceRate: Math.round(acceptanceRate),
    coinsEarned,
  };
}
