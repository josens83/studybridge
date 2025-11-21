import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUserProfile, updateUserProfile } from '@/lib/supabase/users';
import type { UserProfile } from '@/types';

// Query Keys
export const userKeys = {
  all: ['users'] as const,
  profiles: () => [...userKeys.all, 'profile'] as const,
  profile: (id: string) => [...userKeys.profiles(), id] as const,
};

/**
 * Hook to fetch user profile
 */
export function useUserProfile(userId: string | null) {
  return useQuery({
    queryKey: userKeys.profile(userId || ''),
    queryFn: () => getUserProfile(userId!),
    enabled: !!userId,
    staleTime: 10 * 60 * 1000, // 10 minutes - user profiles don't change often
  });
}

/**
 * Hook to update user profile
 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, updates }: { userId: string; updates: Partial<UserProfile> }) =>
      updateUserProfile(userId, updates),
    onSuccess: (updatedProfile) => {
      // Update the profile in cache
      queryClient.setQueryData(userKeys.profile(updatedProfile.id), updatedProfile);
    },
  });
}
