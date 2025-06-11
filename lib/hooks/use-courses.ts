'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService } from '@/lib/services/course-service';
import { CreateCourseData, UpdateCourseData, PaginatedCourses, CourseWithEnrollment, Course } from '@/lib/types/course';
import { toast } from 'sonner';

// Get all courses with pagination and filters
export function useCourses(params: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  instructorId?: string;
  status?: string;
} = {}) {
  return useQuery({
    queryKey: ['courses', params],
    queryFn: (): Promise<PaginatedCourses> => courseService.getCourses(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
}

// Get a single course
export function useCourse(id: string) {
  return useQuery({
    queryKey: ['course', id],
    queryFn: (): Promise<CourseWithEnrollment | null> => courseService.getCourse(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

// Get enrolled courses for students
export function useEnrolledCourses() {
  return useQuery({
    queryKey: ['courses', 'enrolled'],
    queryFn: (): Promise<CourseWithEnrollment[]> => courseService.getEnrolledCourses(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
}

// Get teacher's courses
export function useTeacherCourses() {
  return useQuery({
    queryKey: ['courses', 'teacher'],
    queryFn: (): Promise<Course[]> => courseService.getTeacherCourses(),
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: 2,
  });
}

// Create course mutation
export function useCreateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCourseData): Promise<Course> => courseService.createCourse(data),
    onSuccess: (newCourse) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create course');
    },
  });
}

// Update course mutation
export function useUpdateCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCourseData }): Promise<Course> => 
      courseService.updateCourse(id, data),
    onSuccess: (updatedCourse) => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      queryClient.invalidateQueries({ queryKey: ['course', updatedCourse.id] });
      toast.success('Course updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update course');
    },
  });
}

// Delete course mutation
export function useDeleteCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string): Promise<void> => courseService.deleteCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Course deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete course');
    },
  });
}

// Enroll in course mutation
export function useEnrollInCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => courseService.enrollInCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Successfully enrolled in course!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to enroll in course');
    },
  });
}

// Unenroll from course mutation
export function useUnenrollFromCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => courseService.unenrollFromCourse(courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['courses'] });
      toast.success('Successfully unenrolled from course!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to unenroll from course');
    },
  });
}