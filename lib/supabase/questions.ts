import { supabase } from './client';
import type { Question } from '@/types';

// Create a new question
export async function createQuestion(data: {
  author_id: string;
  author_nickname: string;
  title: string;
  content: string;
  subject: string;
  grade_level: string;
  image_urls?: string[];
  coins_reward: number;
  is_urgent: boolean;
}) {
  const { data: question, error } = await supabase
    .from('questions')
    .insert(data)
    .select()
    .single();

  if (error) throw error;

  // Deduct coins from user
  const { error: coinsError } = await supabase.rpc('deduct_coins', {
    user_id: data.author_id,
    amount: data.coins_reward,
  });

  if (coinsError) throw coinsError;

  // Record coin transaction
  await supabase.from('coin_transactions').insert({
    user_id: data.author_id,
    amount: -data.coins_reward,
    type: 'spend',
    description: `질문 등록: ${data.title}`,
    related_id: question.id,
  });

  // Award points for asking
  await supabase.rpc('add_points', {
    user_id: data.author_id,
    amount: 10,
  });

  await supabase.from('point_transactions').insert({
    user_id: data.author_id,
    amount: 10,
    type: 'earn',
    description: '질문 등록 보상',
    related_id: question.id,
  });

  return question;
}

// Get questions with filters
export async function getQuestions(filters?: {
  subject?: string;
  grade_level?: string;
  is_answered?: boolean;
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.subject) {
    query = query.eq('subject', filters.subject);
  }

  if (filters?.grade_level) {
    query = query.eq('grade_level', filters.grade_level);
  }

  if (filters?.is_answered !== undefined) {
    query = query.eq('is_answered', filters.is_answered);
  }

  if (filters?.limit) {
    query = query.limit(filters.limit);
  }

  if (filters?.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Question[];
}

// Get question by ID
export async function getQuestionById(id: string) {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;

  // Increment views
  await supabase.rpc('increment_question_views', {
    p_question_id: id,
  });

  return data as Question;
}

// Get user's questions
export async function getUserQuestions(userId: string) {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('author_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Question[];
}

// Update question
export async function updateQuestion(
  id: string,
  updates: Partial<Question>
) {
  const { data, error } = await supabase
    .from('questions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Question;
}

// Delete question
export async function deleteQuestion(id: string) {
  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Search questions
export async function searchQuestions(query: string) {
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data as Question[];
}
