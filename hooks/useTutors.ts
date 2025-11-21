import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTutorProfile,
  getFeaturedTutors,
  searchTutors,
  updateTutorSubject,
  removeTutorSubject,
  updateTutorAvailability,
  createOrUpdateTutorReview,
  deleteTutorReview,
  getTutorReviews,
} from '@/lib/supabase/tutors';

// Query Keys
export const tutorKeys = {
  all: ['tutors'] as const,
  lists: () => [...tutorKeys.all, 'list'] as const,
  featured: () => [...tutorKeys.lists(), 'featured'] as const,
  search: (filters: any) => [...tutorKeys.lists(), 'search', filters] as const,
  details: () => [...tutorKeys.all, 'detail'] as const,
  detail: (id: string) => [...tutorKeys.details(), id] as const,
  reviews: (tutorId: string) => [...tutorKeys.all, 'reviews', tutorId] as const,
};

/**
 * Hook to fetch tutor profile
 */
export function useTutorProfile(tutorId: string | null) {
  return useQuery({
    queryKey: tutorKeys.detail(tutorId || ''),
    queryFn: () => getTutorProfile(tutorId!),
    enabled: !!tutorId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to fetch featured tutors
 */
export function useFeaturedTutors(limit: number = 10) {
  return useQuery({
    queryKey: tutorKeys.featured(),
    queryFn: () => getFeaturedTutors(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Hook to search tutors
 */
export function useSearchTutors(filters: {
  subject?: string;
  minRating?: number;
  maxHourlyRate?: number;
  verified?: boolean;
}) {
  return useQuery({
    queryKey: tutorKeys.search(filters),
    queryFn: () => searchTutors(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to update tutor subject
 */
export function useUpdateTutorSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tutorId,
      subject,
      proficiencyLevel,
    }: {
      tutorId: string;
      subject: string;
      proficiencyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    }) => updateTutorSubject(tutorId, subject, proficiencyLevel),
    onSuccess: (_, { tutorId }) => {
      // Invalidate tutor profile
      queryClient.invalidateQueries({ queryKey: tutorKeys.detail(tutorId) });
      queryClient.invalidateQueries({ queryKey: tutorKeys.lists() });
    },
  });
}

/**
 * Hook to remove tutor subject
 */
export function useRemoveTutorSubject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ tutorId, subject }: { tutorId: string; subject: string }) =>
      removeTutorSubject(tutorId, subject),
    onSuccess: (_, { tutorId }) => {
      // Invalidate tutor profile
      queryClient.invalidateQueries({ queryKey: tutorKeys.detail(tutorId) });
      queryClient.invalidateQueries({ queryKey: tutorKeys.lists() });
    },
  });
}

/**
 * Hook to update tutor availability
 */
export function useUpdateTutorAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tutorId,
      availability,
    }: {
      tutorId: string;
      availability: {
        day_of_week: number;
        start_time: string;
        end_time: string;
        is_available: boolean;
      };
    }) => updateTutorAvailability(tutorId, availability),
    onSuccess: (_, { tutorId }) => {
      // Invalidate tutor profile
      queryClient.invalidateQueries({ queryKey: tutorKeys.detail(tutorId) });
    },
  });
}

/**
 * Hook to create or update tutor review
 */
export function useCreateOrUpdateTutorReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      tutorId,
      studentId,
      rating,
      reviewText,
      isAnonymous,
    }: {
      tutorId: string;
      studentId: string;
      rating: number;
      reviewText?: string;
      isAnonymous?: boolean;
    }) => createOrUpdateTutorReview(tutorId, studentId, rating, reviewText, isAnonymous),
    onSuccess: (_, { tutorId }) => {
      // Invalidate tutor profile and reviews
      queryClient.invalidateQueries({ queryKey: tutorKeys.detail(tutorId) });
      queryClient.invalidateQueries({ queryKey: tutorKeys.reviews(tutorId) });
      queryClient.invalidateQueries({ queryKey: tutorKeys.lists() });
    },
  });
}

/**
 * Hook to delete tutor review
 */
export function useDeleteTutorReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      // Invalidate all tutor queries
      queryClient.invalidateQueries({ queryKey: tutorKeys.all });
    },
  });
}

/**
 * Hook to fetch tutor reviews
 */
export function useTutorReviews(tutorId: string | null, limit: number = 20) {
  return useQuery({
    queryKey: tutorKeys.reviews(tutorId || ''),
    queryFn: () => getTutorReviews(tutorId!, limit),
    enabled: !!tutorId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}
