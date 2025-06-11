export interface Course {
  id: string;
  title: string;
  description: string;
  instructorId: string;
  instructorName: string;
  thumbnail?: string;
  durationWeeks: number;
  maxStudents: number;
  currentStudents: number;
  status: 'draft' | 'published' | 'archived';
  rating?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCourseData {
  title: string;
  description: string;
  durationWeeks: number;
  maxStudents: number;
  thumbnail?: string;
}

export interface UpdateCourseData extends Partial<CreateCourseData> {
  status?: 'draft' | 'published' | 'archived';
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrolledAt: string;
  progress: number;
  status: 'active' | 'completed' | 'dropped';
}

export interface CourseWithEnrollment extends Course {
  enrollment?: Enrollment;
  isEnrolled: boolean;
}

export interface PaginatedCourses {
  courses: CourseWithEnrollment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}