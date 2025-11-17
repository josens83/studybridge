import { supabase } from './client';

export interface Bookmark {
  id: string;
  user_id: string;
  question_id: string;
  created_at: string;
}

/**
 * Add a bookmark for a question
 */
export async function addBookmark(userId: string, questionId: string): Promise<void> {
  const { error } = await supabase
    .from('bookmarks')
    .insert({
      user_id: userId,
      question_id: questionId,
    });

  if (error) throw error;
}

/**
 * Remove a bookmark
 */
export async function removeBookmark(userId: string, questionId: string): Promise<void> {
  const { error } = await supabase
    .from('bookmarks')
    .delete()
    .eq('user_id', userId)
    .eq('question_id', questionId);

  if (error) throw error;
}

/**
 * Check if a question is bookmarked by a user
 */
export async function isBookmarked(userId: string, questionId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', userId)
    .eq('question_id', questionId)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
  return !!data;
}

/**
 * Get all bookmarked questions for a user
 */
export async function getUserBookmarks(userId: string) {
  const { data, error } = await supabase
    .from('bookmarks')
    .select(`
      id,
      created_at,
      questions (
        id,
        title,
        content,
        subject,
        grade_level,
        coins_reward,
        is_answered,
        is_urgent,
        views,
        created_at,
        author_id,
        author_nickname
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Transform the data to extract questions
  return data?.map((bookmark: any) => ({
    bookmarkId: bookmark.id,
    bookmarkedAt: bookmark.created_at,
    ...bookmark.questions,
  })) || [];
}

/**
 * Get bookmark count for a question
 */
export async function getBookmarkCount(questionId: string): Promise<number> {
  const { count, error } = await supabase
    .from('bookmarks')
    .select('*', { count: 'exact', head: true })
    .eq('question_id', questionId);

  if (error) throw error;
  return count || 0;
}

/**
 * Toggle bookmark (add if not bookmarked, remove if bookmarked)
 */
export async function toggleBookmark(userId: string, questionId: string): Promise<boolean> {
  const bookmarked = await isBookmarked(userId, questionId);

  if (bookmarked) {
    await removeBookmark(userId, questionId);
    return false; // Now not bookmarked
  } else {
    await addBookmark(userId, questionId);
    return true; // Now bookmarked
  }
}
