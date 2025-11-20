import { supabase } from './client';
import type { Question } from '@/types';

export interface SearchFilters {
  query?: string;
  subject?: string;
  gradeLevel?: string;
  isAnswered?: boolean;
  isUrgent?: boolean;
  tags?: string[];
  sortBy?: 'relevance' | 'recent' | 'popular' | 'unanswered';
}

export interface SearchResult {
  questions: Question[];
  totalCount: number;
}

/**
 * Search questions with full-text search and filters
 */
export async function searchQuestions(
  filters: SearchFilters,
  page: number = 1,
  pageSize: number = 20
): Promise<SearchResult> {
  let query = supabase
    .from('questions')
    .select('*', { count: 'exact' });

  // Full-text search
  if (filters.query && filters.query.trim()) {
    // Use text search on search_vector
    query = query.textSearch('search_vector', filters.query.trim(), {
      type: 'websearch',
      config: 'simple',
    });
  }

  // Filter by subject
  if (filters.subject) {
    query = query.eq('subject', filters.subject);
  }

  // Filter by grade level
  if (filters.gradeLevel) {
    query = query.eq('grade_level', filters.gradeLevel);
  }

  // Filter by answered status
  if (filters.isAnswered !== undefined) {
    query = query.eq('is_answered', filters.isAnswered);
  }

  // Filter by urgent status
  if (filters.isUrgent !== undefined) {
    query = query.eq('is_urgent', filters.isUrgent);
  }

  // Filter by tags
  if (filters.tags && filters.tags.length > 0) {
    // Get questions that have at least one of the specified tags
    const { data: taggedQuestions } = await supabase
      .from('question_tags')
      .select('question_id')
      .in('tag_id', filters.tags);

    if (taggedQuestions && taggedQuestions.length > 0) {
      const questionIds = taggedQuestions.map(qt => qt.question_id);
      query = query.in('id', questionIds);
    } else {
      // No questions found with these tags
      return { questions: [], totalCount: 0 };
    }
  }

  // Sort
  switch (filters.sortBy) {
    case 'recent':
      query = query.order('created_at', { ascending: false });
      break;
    case 'popular':
      query = query.order('views', { ascending: false });
      break;
    case 'unanswered':
      query = query
        .eq('is_answered', false)
        .order('created_at', { ascending: false });
      break;
    case 'relevance':
    default:
      // If there's a search query, order by relevance (textSearch does this automatically)
      // Otherwise, order by created_at
      if (!filters.query) {
        query = query.order('created_at', { ascending: false });
      }
      break;
  }

  // Pagination
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Search error:', error);
    throw new Error('질문 검색 중 오류가 발생했습니다.');
  }

  return {
    questions: data || [],
    totalCount: count || 0,
  };
}

/**
 * Get popular tags
 */
export async function getPopularTags(limit: number = 20) {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('usage_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }

  return data || [];
}

/**
 * Get all tags
 */
export async function getAllTags() {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching tags:', error);
    return [];
  }

  return data || [];
}

/**
 * Get tags for a question
 */
export async function getQuestionTags(questionId: string) {
  const { data, error } = await supabase
    .from('question_tags')
    .select(`
      tag_id,
      tags (
        id,
        name,
        slug
      )
    `)
    .eq('question_id', questionId);

  if (error) {
    console.error('Error fetching question tags:', error);
    return [];
  }

  return data?.map(qt => (qt as any).tags) || [];
}

/**
 * Add tags to a question
 */
export async function addTagsToQuestion(questionId: string, tagIds: string[]) {
  const insertData = tagIds.map(tagId => ({
    question_id: questionId,
    tag_id: tagId,
  }));

  const { error } = await supabase
    .from('question_tags')
    .insert(insertData);

  if (error) {
    console.error('Error adding tags:', error);
    throw new Error('태그 추가 중 오류가 발생했습니다.');
  }
}

/**
 * Remove a tag from a question
 */
export async function removeTagFromQuestion(questionId: string, tagId: string) {
  const { error } = await supabase
    .from('question_tags')
    .delete()
    .eq('question_id', questionId)
    .eq('tag_id', tagId);

  if (error) {
    console.error('Error removing tag:', error);
    throw new Error('태그 제거 중 오류가 발생했습니다.');
  }
}

/**
 * Create a new tag (admin only)
 */
export async function createTag(name: string, description?: string) {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '');

  const { data, error } = await supabase
    .from('tags')
    .insert({
      name,
      slug,
      description,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating tag:', error);
    throw new Error('태그 생성 중 오류가 발생했습니다.');
  }

  return data;
}

/**
 * Get auto-complete suggestions for search
 */
export async function getSearchSuggestions(query: string, limit: number = 5) {
  if (!query || query.trim().length < 2) {
    return [];
  }

  const { data, error } = await supabase
    .from('questions')
    .select('id, title')
    .textSearch('search_vector', query.trim(), {
      type: 'websearch',
      config: 'simple',
    })
    .limit(limit);

  if (error) {
    console.error('Error fetching suggestions:', error);
    return [];
  }

  return data || [];
}
