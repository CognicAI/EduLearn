'use client';

import { useQuery } from '@tanstack/react-query';
import { UserRole } from '@/lib/types/auth';
import apiClient from '@/lib/apiClient';

interface DashboardStats {
  totalCourses?: number;
  totalStudents?: number;
  totalUsers?: number;
  completionRate?: number;
  pendingGrades?: number;
  upcomingDeadlines?: number;
  achievements?: number;
  systemUptime?: string;
  activeUsers?: number;
  newUsers30d?: number;
  totalTeachers?: number;
  totalAdmins?: number;
  activeCourses?: number;
  draftCourses?: number;
  archivedCourses?: number;
  avgCourseRating?: string;
  totalEnrollments?: number;
  activeEnrollments?: number;
  completedEnrollments?: number;
  avgProgress?: string;
  totalRevenue?: number;
  revenue30d?: number;
  totalTransactions?: number;
  totalAssignments?: number;
  activeAssignments?: number;
}

interface DashboardActivity {
  id: string;
  type: 'assignment' | 'course' | 'grade' | 'system' | 'user' | 'submission' | 'question' | 'alert' | 'enrollment';
  title: string;
  description?: string;
  user?: string;
  course?: string;
  time: string;
}

interface DashboardData {
  stats: DashboardStats;
  recentActivity: DashboardActivity[];
  courses?: any[];
  upcomingDeadlines?: any[];
  systemAlerts?: any[];
}

export function useDashboardData(role: UserRole) {
  return useQuery({
    queryKey: ['dashboard', role],
    queryFn: async (): Promise<DashboardData> => {
      try {
        const response = await apiClient.get(`/dashboard/${role}`);
        return response.data.data;
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
}