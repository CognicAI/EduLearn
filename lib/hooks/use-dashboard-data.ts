'use client';

import { useQuery } from '@tanstack/react-query';
import { UserRole } from '@/lib/types/auth';

interface DashboardStats {
  totalCourses?: number;
  totalStudents?: number;
  totalUsers?: number;
  completionRate?: number;
  pendingGrades?: number;
  upcomingDeadlines?: number;
  achievements?: number;
  systemUptime?: string;
}

interface DashboardActivity {
  id: string;
  type: 'assignment' | 'course' | 'grade' | 'system' | 'user' | 'submission' | 'question' | 'alert';
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

// Mock data generators for different roles
const generateStudentData = (): DashboardData => ({
  stats: {
    totalCourses: 3,
    completionRate: 75,
    upcomingDeadlines: 2,
    achievements: 12,
  },
  recentActivity: [
    {
      id: '1',
      type: 'assignment',
      title: 'JavaScript Functions Quiz',
      course: 'Web Development',
      time: '2 hours ago'
    },
    {
      id: '2',
      type: 'course',
      title: 'Completed Module 4',
      course: 'Computer Science',
      time: '1 day ago'
    },
    {
      id: '3',
      type: 'grade',
      title: 'Received grade for Math Test',
      course: 'Advanced Mathematics',
      time: '2 days ago'
    }
  ],
  courses: [
    {
      id: '1',
      title: 'Introduction to Computer Science',
      instructor: 'Prof. Johnson',
      progress: 75,
      nextDeadline: 'Assignment due in 3 days',
      status: 'active',
    },
    {
      id: '2',
      title: 'Advanced Mathematics',
      instructor: 'Dr. Smith',
      progress: 60,
      nextDeadline: 'Quiz tomorrow',
      status: 'active',
    },
    {
      id: '3',
      title: 'Web Development Fundamentals',
      instructor: 'Ms. Davis',
      progress: 90,
      nextDeadline: 'Final project next week',
      status: 'nearly-complete',
    }
  ]
});

const generateTeacherData = (): DashboardData => ({
  stats: {
    totalCourses: 3,
    totalStudents: 105,
    pendingGrades: 17,
    completionRate: 87,
  },
  recentActivity: [
    {
      id: '1',
      type: 'submission',
      title: 'New assignment submission',
      user: 'John Doe',
      course: 'Computer Science',
      time: '1 hour ago'
    },
    {
      id: '2',
      type: 'question',
      title: 'Student question posted',
      user: 'Jane Smith',
      course: 'Web Development',
      time: '3 hours ago'
    },
    {
      id: '3',
      type: 'grade',
      title: 'Grades published',
      course: 'Database Design',
      time: '1 day ago'
    }
  ],
  courses: [
    {
      id: '1',
      title: 'Introduction to Computer Science',
      students: 45,
      assignments: 8,
      pendingGrades: 12,
      status: 'active',
    },
    {
      id: '2',
      title: 'Advanced Web Development',
      students: 32,
      assignments: 6,
      pendingGrades: 5,
      status: 'active',
    },
    {
      id: '3',
      title: 'Database Design Fundamentals',
      students: 28,
      assignments: 4,
      pendingGrades: 0,
      status: 'completed',
    }
  ],
  upcomingDeadlines: [
    {
      title: 'Final Project Submissions',
      course: 'Computer Science',
      date: 'Tomorrow',
      type: 'assignment'
    },
    {
      title: 'Midterm Exam',
      course: 'Web Development',
      date: 'In 3 days',
      type: 'exam'
    },
    {
      title: 'Quiz 3',
      course: 'Database Design',
      date: 'Next Monday',
      type: 'quiz'
    }
  ]
});

const generateAdminData = (): DashboardData => ({
  stats: {
    totalUsers: 1247,
    totalCourses: 89,
    systemUptime: '99.9%',
  },
  recentActivity: [
    {
      id: '1',
      type: 'user',
      title: 'New teacher registration',
      user: 'Dr. Emily Johnson',
      time: '2 hours ago'
    },
    {
      id: '2',
      type: 'course',
      title: 'Course "AI Fundamentals" created',
      user: 'Prof. Smith',
      time: '4 hours ago'
    },
    {
      id: '3',
      type: 'system',
      title: 'System backup completed',
      time: '6 hours ago'
    },
    {
      id: '4',
      type: 'alert',
      title: 'High server load detected',
      time: '8 hours ago'
    }
  ],
  systemAlerts: [
    {
      type: 'warning',
      title: 'High server load detected',
      description: 'CPU usage above 80% for the past 30 minutes. Consider scaling resources.',
      time: '2 hours ago',
      priority: 'high'
    },
    {
      type: 'success',
      title: 'Backup completed successfully',
      description: 'Daily system backup completed without any issues. All data is secure.',
      time: '4 hours ago',
      priority: 'low'
    },
    {
      type: 'info',
      title: 'Scheduled maintenance window',
      description: 'Database optimization and security updates planned for tomorrow at 2:00 AM EST.',
      time: '1 day ago',
      priority: 'medium'
    },
    {
      type: 'warning',
      title: 'Storage capacity warning',
      description: 'File storage is at 85% capacity. Consider archiving old files.',
      time: '6 hours ago',
      priority: 'medium'
    },
    {
      type: 'info',
      title: 'New feature deployment',
      description: 'Enhanced analytics dashboard will be available next week.',
      time: '2 days ago',
      priority: 'low'
    }
  ]
});

export function useDashboardData(role: UserRole) {
  return useQuery({
    queryKey: ['dashboard', role],
    queryFn: async (): Promise<DashboardData> => {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      switch (role) {
        case 'student':
          return generateStudentData();
        case 'teacher':
          return generateTeacherData();
        case 'admin':
          return generateAdminData();
        default:
          throw new Error('Invalid role');
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
}