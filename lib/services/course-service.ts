import { Course, CreateCourseData, UpdateCourseData, CourseWithEnrollment, PaginatedCourses, Enrollment } from '@/lib/types/course';
import authService from '@/lib/auth/auth-service';
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Mock course database
let mockCourses: Course[] = [
  {
    id: '1',
    title: 'Introduction to Computer Science',
    description: 'Learn the fundamentals of computer science including algorithms, data structures, and programming concepts.',
    instructorId: '550e8400-e29b-41d4-a716-446655440002',
    instructorName: 'Prof. Johnson',
    thumbnail: 'https://images.pexels.com/photos/574071/pexels-photo-574071.jpeg?auto=compress&cs=tinysrgb&w=400',
    durationWeeks: 12,
    maxStudents: 50,
    currentStudents: 45,
    status: 'published',
    rating: 4.8,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  },
  {
    id: '2',
    title: 'Advanced Web Development',
    description: 'Master modern web development with React, Node.js, and advanced JavaScript concepts.',
    instructorId: '550e8400-e29b-41d4-a716-446655440002',
    instructorName: 'Dr. Smith',
    thumbnail: 'https://images.pexels.com/photos/11035380/pexels-photo-11035380.jpeg?auto=compress&cs=tinysrgb&w=400',
    durationWeeks: 10,
    maxStudents: 30,
    currentStudents: 32,
    status: 'published',
    rating: 4.9,
    createdAt: '2024-01-02T00:00:00.000Z',
    updatedAt: '2024-01-02T00:00:00.000Z',
  },
  {
    id: '3',
    title: 'Database Design Fundamentals',
    description: 'Learn database design principles, SQL, and modern database management systems.',
    instructorId: '550e8400-e29b-41d4-a716-446655440002',
    instructorName: 'Ms. Davis',
    thumbnail: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=400',
    durationWeeks: 8,
    maxStudents: 40,
    currentStudents: 28,
    status: 'published',
    rating: 4.7,
    createdAt: '2024-01-03T00:00:00.000Z',
    updatedAt: '2024-01-03T00:00:00.000Z',
  },
  {
    id: '4',
    title: 'Machine Learning Basics',
    description: 'Introduction to machine learning algorithms, data analysis, and AI fundamentals.',
    instructorId: '550e8400-e29b-41d4-a716-446655440002',
    instructorName: 'Prof. Wilson',
    thumbnail: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=400',
    durationWeeks: 14,
    maxStudents: 60,
    currentStudents: 67,
    status: 'published',
    rating: 4.6,
    createdAt: '2024-01-04T00:00:00.000Z',
    updatedAt: '2024-01-04T00:00:00.000Z',
  },
  {
    id: '5',
    title: 'Digital Marketing Strategy',
    description: 'Learn modern digital marketing techniques, social media strategy, and analytics.',
    instructorId: '550e8400-e29b-41d4-a716-446655440003',
    instructorName: 'Ms. Brown',
    thumbnail: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=400',
    durationWeeks: 6,
    maxStudents: 80,
    currentStudents: 89,
    status: 'published',
    rating: 4.5,
    createdAt: '2024-01-05T00:00:00.000Z',
    updatedAt: '2024-01-05T00:00:00.000Z',
  },
  {
    id: '6',
    title: 'Mobile App Development',
    description: 'Build native and cross-platform mobile applications using modern frameworks.',
    instructorId: '550e8400-e29b-41d4-a716-446655440002',
    instructorName: 'Dr. Lee',
    thumbnail: 'https://images.pexels.com/photos/607812/pexels-photo-607812.jpeg?auto=compress&cs=tinysrgb&w=400',
    durationWeeks: 16,
    maxStudents: 35,
    currentStudents: 41,
    status: 'published',
    rating: 4.8,
    createdAt: '2024-01-06T00:00:00.000Z',
    updatedAt: '2024-01-06T00:00:00.000Z',
  },
];

// Mock enrollments database
let mockEnrollments: Enrollment[] = [
  {
    id: '1',
    studentId: '550e8400-e29b-41d4-a716-446655440001',
    courseId: '1',
    enrolledAt: '2024-01-10T00:00:00.000Z',
    progress: 75,
    status: 'active',
  },
  {
    id: '2',
    studentId: '550e8400-e29b-41d4-a716-446655440001',
    courseId: '2',
    enrolledAt: '2024-01-11T00:00:00.000Z',
    progress: 60,
    status: 'active',
  },
  {
    id: '3',
    studentId: '550e8400-e29b-41d4-a716-446655440001',
    courseId: '3',
    enrolledAt: '2024-01-12T00:00:00.000Z',
    progress: 90,
    status: 'active',
  },
];

class CourseService {
  // Get all courses with pagination and filters
  async getCourses(params: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    instructorId?: string;
    status?: string;
  } = {}): Promise<PaginatedCourses> {
    const { page = 1, limit = 12, search = '', category = '', instructorId = '', status = '' } = params;
    // Build query URL
    const url = new URL(`${API_BASE_URL}/courses`);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('limit', limit.toString());
    if (search) url.searchParams.append('search', search);
    if (category) url.searchParams.append('category', category);
    if (instructorId) url.searchParams.append('instructorId', instructorId);
    if (status) url.searchParams.append('status', status);
    // Fetch from backend
    const token = authService.getAccessToken();
    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || 'Failed to fetch courses');
    }
    const data = await response.json();
    return data as PaginatedCourses;
  }

  // Get a single course by ID
  async getCourse(id: string): Promise<CourseWithEnrollment | null> {
    await new Promise(resolve => setTimeout(resolve, 200));

    const currentUser = await authService.getCurrentUser();
    const course = mockCourses.find(c => c.id === id);

    if (!course) {
      return null;
    }

    // Check permissions
    if (currentUser?.role === 'student' && course.status !== 'published') {
      return null;
    }

    const enrollment = currentUser?.role === 'student' 
      ? mockEnrollments.find(e => e.courseId === course.id && e.studentId === currentUser.id)
      : undefined;

    return {
      ...course,
      enrollment,
      isEnrolled: !!enrollment,
    };
  }

  // Create a new course (teachers only)
  async createCourse(data: CreateCourseData): Promise<Course> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const currentUser = await authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'teacher') {
      throw new Error('Only teachers can create courses');
    }

    const newCourse: Course = {
      id: Date.now().toString(),
      ...data,
      instructorId: currentUser.id,
      instructorName: `${currentUser.firstName} ${currentUser.lastName}`,
      currentStudents: 0,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    mockCourses.push(newCourse);
    return newCourse;
  }

  // Update a course (teachers only, own courses)
  async updateCourse(id: string, data: UpdateCourseData): Promise<Course> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const currentUser = await authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'teacher') {
      throw new Error('Only teachers can update courses');
    }

    const courseIndex = mockCourses.findIndex(c => c.id === id);
    if (courseIndex === -1) {
      throw new Error('Course not found');
    }

    const course = mockCourses[courseIndex];
    if (course.instructorId !== currentUser.id) {
      throw new Error('You can only update your own courses');
    }

    const updatedCourse = {
      ...course,
      ...data,
      updatedAt: new Date().toISOString(),
    };

    mockCourses[courseIndex] = updatedCourse;
    return updatedCourse;
  }

  // Delete a course (teachers only, own courses)
  async deleteCourse(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const currentUser = await authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'teacher') {
      throw new Error('Only teachers can delete courses');
    }

    const courseIndex = mockCourses.findIndex(c => c.id === id);
    if (courseIndex === -1) {
      throw new Error('Course not found');
    }

    const course = mockCourses[courseIndex];
    if (course.instructorId !== currentUser.id) {
      throw new Error('You can only delete your own courses');
    }

    // Remove course and related enrollments
    mockCourses.splice(courseIndex, 1);
    mockEnrollments = mockEnrollments.filter(e => e.courseId !== id);
  }

  // Enroll in a course (students only)
  async enrollInCourse(courseId: string): Promise<Enrollment> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const currentUser = await authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'student') {
      throw new Error('Only students can enroll in courses');
    }

    const course = mockCourses.find(c => c.id === courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    if (course.status !== 'published') {
      throw new Error('Cannot enroll in unpublished course');
    }

    // Check if already enrolled
    const existingEnrollment = mockEnrollments.find(
      e => e.courseId === courseId && e.studentId === currentUser.id
    );
    if (existingEnrollment) {
      throw new Error('Already enrolled in this course');
    }

    // Check if course is full
    if (course.currentStudents >= course.maxStudents) {
      throw new Error('Course is full');
    }

    const enrollment: Enrollment = {
      id: Date.now().toString(),
      studentId: currentUser.id,
      courseId,
      enrolledAt: new Date().toISOString(),
      progress: 0,
      status: 'active',
    };

    mockEnrollments.push(enrollment);

    // Update course student count
    const courseIndex = mockCourses.findIndex(c => c.id === courseId);
    if (courseIndex !== -1) {
      mockCourses[courseIndex].currentStudents += 1;
    }

    return enrollment;
  }

  // Unenroll from a course (students only)
  async unenrollFromCourse(courseId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));

    const currentUser = await authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'student') {
      throw new Error('Only students can unenroll from courses');
    }

    const enrollmentIndex = mockEnrollments.findIndex(
      e => e.courseId === courseId && e.studentId === currentUser.id
    );

    if (enrollmentIndex === -1) {
      throw new Error('Not enrolled in this course');
    }

    mockEnrollments.splice(enrollmentIndex, 1);

    // Update course student count
    const courseIndex = mockCourses.findIndex(c => c.id === courseId);
    if (courseIndex !== -1) {
      mockCourses[courseIndex].currentStudents -= 1;
    }
  }

  // Get enrolled courses for a student
  async getEnrolledCourses(): Promise<CourseWithEnrollment[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const currentUser = await authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'student') {
      throw new Error('Only students can view enrolled courses');
    }

    const userEnrollments = mockEnrollments.filter(e => e.studentId === currentUser.id);
    const enrolledCourses: CourseWithEnrollment[] = [];

    for (const enrollment of userEnrollments) {
      const course = mockCourses.find(c => c.id === enrollment.courseId);
      if (course) {
        enrolledCourses.push({
          ...course,
          enrollment,
          isEnrolled: true,
        });
      }
    }

    return enrolledCourses;
  }

  // Get courses created by a teacher
  async getTeacherCourses(): Promise<Course[]> {
    await new Promise(resolve => setTimeout(resolve, 300));

    const currentUser = await authService.getCurrentUser();
    if (!currentUser || currentUser.role !== 'teacher') {
      throw new Error('Only teachers can view their courses');
    }

    return mockCourses.filter(course => course.instructorId === currentUser.id);
  }
}

export const courseService = new CourseService();