'use client';

import { useQuery } from '@tanstack/react-query';
import authService from '@/lib/auth/auth-service';
import { User } from '@/lib/types/auth';

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async (): Promise<User | null> => {
      return await authService.getCurrentUser();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}

export function useUserProfile() {
  return useQuery({
    queryKey: ['user', 'profile'],
    queryFn: async (): Promise<User | null> => {
      // This would typically call a separate profile endpoint
      // For now, we'll use the same getCurrentUser method
      return await authService.getCurrentUser();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}