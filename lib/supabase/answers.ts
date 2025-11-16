import { supabase } from './client';
import type { Answer } from '@/types';

// Create a new answer
export async function createAnswer(data: {
  question_id: string;
  author_id: string;
  author_nickname: string;
  author_role: string;
  content: string;
  image_urls?: string[];
}) {
  const { data: answer, error } = await supabase
    .from('answers')
    .insert(data)
    .select()
    .single();

  if (error) throw error;

  // Award points for answering
  await supabase.rpc('add_points', {
    user_id: data.author_id,
    amount: 20,
  });

  await supabase.from('point_transactions').insert({
    user_id: data.author_id,
    amount: 20,
    type: 'earn',
    description: '답변 작성 보상',
    related_id: answer.id,
  });

  // Get question details for notification
  const { data: question } = await supabase
    .from('questions')
    .select('author_id, title')
    .eq('id', data.question_id)
    .single();

  if (question && question.author_id !== data.author_id) {
    // Create notification for question author
    await supabase.from('notifications').insert({
      user_id: question.author_id,
      type: 'answer',
      title: '새로운 답변',
      content: `"${question.title}" 질문에 새로운 답변이 달렸습니다.`,
      link: `/question/${data.question_id}`,
    });
  }

  return answer;
}

// Get answers for a question
export async function getAnswersByQuestionId(questionId: string) {
  const { data, error } = await supabase
    .from('answers')
    .select('*')
    .eq('question_id', questionId)
    .order('is_accepted', { ascending: false })
    .order('upvotes', { ascending: false })
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as Answer[];
}

// Get user's answers
export async function getUserAnswers(userId: string) {
  const { data, error } = await supabase
    .from('answers')
    .select('*, questions(title, subject)')
    .eq('author_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// Update answer
export async function updateAnswer(id: string, content: string) {
  const { data, error } = await supabase
    .from('answers')
    .update({ content })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Answer;
}

// Delete answer
export async function deleteAnswer(id: string) {
  const { error } = await supabase
    .from('answers')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Accept answer
export async function acceptAnswer(
  questionId: string,
  answerId: string,
  questionAuthorId: string
) {
  const { error } = await supabase.rpc('accept_answer', {
    p_question_id: questionId,
    p_answer_id: answerId,
    p_question_author_id: questionAuthorId,
  });

  if (error) throw error;
}

// Upvote answer
export async function upvoteAnswer(answerId: string) {
  const { error } = await supabase.rpc('upvote_answer', {
    p_answer_id: answerId,
  });

  if (error) throw error;
}
