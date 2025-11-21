import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getQuestions,
  getQuestionById,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  type QuestionsFilters,
} from '@/lib/supabase/questions';
import type { Question } from '@/types';

// Query Keys
export const questionKeys = {
  all: ['questions'] as const,
  lists: () => [...questionKeys.all, 'list'] as const,
  list: (filters: QuestionsFilters) => [...questionKeys.lists(), filters] as const,
  details: () => [...questionKeys.all, 'detail'] as const,
  detail: (id: string) => [...questionKeys.details(), id] as const,
};

/**
 * Hook to fetch a paginated list of questions
 */
export function useQuestions(filters: QuestionsFilters = {}, page: number = 1) {
  return useQuery({
    queryKey: questionKeys.list({ ...filters, page }),
    queryFn: () => getQuestions(filters, page),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch a single question by ID
 */
export function useQuestion(id: string | null) {
  return useQuery({
    queryKey: questionKeys.detail(id || ''),
    queryFn: () => getQuestionById(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to create a new question
 */
export function useCreateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createQuestion,
    onSuccess: (newQuestion) => {
      // Invalidate and refetch questions list
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });

      // Add the new question to the cache
      queryClient.setQueryData(questionKeys.detail(newQuestion.id), newQuestion);
    },
  });
}

/**
 * Hook to update a question
 */
export function useUpdateQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Question> }) =>
      updateQuestion(id, data),
    onSuccess: (updatedQuestion) => {
      // Update the question in cache
      queryClient.setQueryData(questionKeys.detail(updatedQuestion.id), updatedQuestion);

      // Invalidate questions list to refetch
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
    },
  });
}

/**
 * Hook to delete a question
 */
export function useDeleteQuestion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteQuestion,
    onSuccess: (_, deletedId) => {
      // Remove question from cache
      queryClient.removeQueries({ queryKey: questionKeys.detail(deletedId) });

      // Invalidate questions list to refetch
      queryClient.invalidateQueries({ queryKey: questionKeys.lists() });
    },
  });
}
