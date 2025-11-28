import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/apiClient';

export interface Course {
    id: string;
    title: string;
    slug: string;
    description: string;
    thumbnail?: string;
    level: string;
    status: string;
    progress: number;
    instructor: string;
    next_deadline?: string;
    enrollment_date: string;
}

export function useStudentCourses(status?: string) {
    return useQuery({
        queryKey: ['student-courses', status],
        queryFn: async (): Promise<Course[]> => {
            const params = status ? { status } : {};
            const response = await apiClient.get('/courses/my-courses', { params });
            return response.data.data;
        },
    });
}
