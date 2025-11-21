import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAnswersByQuestionId,
  createAnswer,
  updateAnswer,
  deleteAnswer,
  acceptAnswer,
  upvoteAnswer,
} from '@/lib/supabase/answers';
import { questionKeys } from './useQuestions';

// Query Keys
export const answerKeys = {
  all: ['answers'] as const,
  byQuestion: (questionId: string) => [...answerKeys.all, 'question', questionId] as const,
};

/**
 * Hook to fetch answers for a question
 */
export function useAnswers(questionId: string | null) {
  return useQuery({
    queryKey: answerKeys.byQuestion(questionId || ''),
    queryFn: () => getAnswersByQuestionId(questionId!),
    enabled: !!questionId,
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

/**
 * Hook to create an answer
 */
export function useCreateAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createAnswer,
    onSuccess: (newAnswer) => {
      // Invalidate answers for this question
      queryClient.invalidateQueries({
        queryKey: answerKeys.byQuestion(newAnswer.question_id),
      });

      // Invalidate the question to update answer count
      queryClient.invalidateQueries({
        queryKey: questionKeys.detail(newAnswer.question_id),
      });
    },
  });
}

/**
 * Hook to update an answer
 */
export function useUpdateAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ answerId, content }: { answerId: string; content: string }) =>
      updateAnswer(answerId, content),
    onSuccess: (updatedAnswer) => {
      // Invalidate answers for this question
      queryClient.invalidateQueries({
        queryKey: answerKeys.byQuestion(updatedAnswer.question_id),
      });
    },
  });
}

/**
 * Hook to delete an answer
 */
export function useDeleteAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAnswer,
    onSuccess: (_, answerId) => {
      // Invalidate all answer queries (we don't have question ID here)
      queryClient.invalidateQueries({ queryKey: answerKeys.all });

      // Invalidate all questions to update answer counts
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
    },
  });
}

/**
 * Hook to accept an answer
 */
export function useAcceptAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      questionId,
      answerId,
      authorId,
    }: {
      questionId: string;
      answerId: string;
      authorId: string;
    }) => acceptAnswer(questionId, answerId, authorId),
    onSuccess: (_, { questionId }) => {
      // Invalidate answers for this question
      queryClient.invalidateQueries({
        queryKey: answerKeys.byQuestion(questionId),
      });

      // Invalidate the question
      queryClient.invalidateQueries({
        queryKey: questionKeys.detail(questionId),
      });
    },
  });
}

/**
 * Hook to upvote an answer
 */
export function useUpvoteAnswer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upvoteAnswer,
    onSuccess: (_, answerId) => {
      // Invalidate all answer queries
      queryClient.invalidateQueries({ queryKey: answerKeys.all });
    },
  });
}
