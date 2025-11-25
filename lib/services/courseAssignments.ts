import { authService } from '@/lib/auth/auth-service';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const getAuthHeaders = () => {
    const token = authService.getAccessToken();
    return {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
};

// ========== Types ==========

export interface Course {
    id: string;
    title: string;
    description?: string;
    instructor_id: string;
    category_id: string;
    level?: string;
    price?: number;
    status: 'draft' | 'published' | 'archived';
    is_owner?: boolean;
    can_edit?: boolean;
    can_delete?: boolean;
    category_name?: string;
    module_count?: number;
    lesson_count?: number;
    enrollment_count?: number;
}

export interface AssignedTeacher {
    id: string;
    teacher_id: string;
    teacher_name: string;
    teacher_email: string;
    can_edit: boolean;
    can_delete: boolean;
    assigned_at: string;
    assigned_by_name?: string;
    notes?: string;
}

export interface CourseTeachersResponse {
    course: {
        id: string;
        title: string;
        instructor: {
            id: string;
            name: string;
            email: string;
            isOwner: true;
        };
    };
    assignedTeachers: AssignedTeacher[];
}

export interface AssignTeachersRequest {
    teacherIds: string[];
    canEdit?: boolean;
    canDelete?: boolean;
    notes?: string;
}

// ========== API Functions ==========

/**
 * Get teacher's courses (includes both owned and assigned courses)
 */
export async function getTeacherCourses(filters?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
}): Promise<{ data: Course[]; pagination: any }> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const url = `${API_URL}/courses/teacher${params.toString() ? `?${params}` : ''}`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return {
        data: json.data,
        pagination: json.pagination
    };
}

/**
 * Get all teachers assigned to a course (Admin only)
 */
export async function getCourseTeachers(courseId: string): Promise<CourseTeachersResponse> {
    const res = await fetch(`${API_URL}/admin/courses/${courseId}/teachers`, {
        headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
}

/**
 * Assign teachers to a course (Admin only)
 */
export async function assignTeachersToCourse(
    courseId: string,
    params: AssignTeachersRequest
): Promise<AssignedTeacher[]> {
    const res = await fetch(`${API_URL}/admin/courses/${courseId}/teachers`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(params)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
}

/**
 * Remove a teacher from a course (Admin only)
 */
export async function removeTeacherFromCourse(
    courseId: string,
    teacherId: string
): Promise<void> {
    const res = await fetch(`${API_URL}/admin/courses/${courseId}/teachers/${teacherId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
}

/**
 * Get all courses (Admin only)
 */
export async function getAllCourses(filters?: {
    status?: string;
    category?: string;
    instructor?: string;
    search?: string;
    page?: number;
    limit?: number;
}): Promise<{ data: Course[]; pagination: any }> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.category) params.append('category', filters.category);
    if (filters?.instructor) params.append('instructor', filters.instructor);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const url = `${API_URL}/admin/courses${params.toString() ? `?${params}` : ''}`;
    const res = await fetch(url, { headers: getAuthHeaders() });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return {
        data: json.data,
        pagination: json.pagination
    };
}

/**
 * Get all users with teacher role (Admin only)
 */
export async function getTeachers(): Promise<any[]> {
    const res = await fetch(`${API_URL}/admin/users?role=teacher`, {
        headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
}
/**
 * Get course modules
 */
export async function getCourseModules(courseId: string): Promise<any[]> {
    const res = await fetch(`${API_URL}/courses/${courseId}/modules`, {
        headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
}

/**
 * Get course assignments
 */
export async function getCourseAssignments(courseId: string): Promise<any[]> {
    const res = await fetch(`${API_URL}/courses/${courseId}/assignments`, {
        headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
}

/**
 * Get course files
 */
export async function getCourseFiles(courseId: string): Promise<any[]> {
    const res = await fetch(`${API_URL}/courses/${courseId}/files`, {
        headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
}

/**
 * Get course announcements
 */
export async function getCourseAnnouncements(courseId: string): Promise<any[]> {
    const res = await fetch(`${API_URL}/courses/${courseId}/announcements`, {
        headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
}
/**
 * Create a new module
 */
/**
 * Create a new module
 */
export async function createModule(courseId: string, data: { title: string; description?: string; sort_order?: number; parentId?: string }): Promise<any> {
    const res = await fetch(`${API_URL}/courses/${courseId}/modules`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
}

/**
 * Create a new lesson
 */
export const createLesson = async (courseId: string, moduleId: string, data: any) => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/modules/${moduleId}/lessons`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
    });
    return response.json();
};

/**
 * Create a new assignment
 */
export async function createAssignment(courseId: string, data: { title: string; description?: string; due_date?: string; max_points?: number; assignment_type?: string }): Promise<any> {
    const res = await fetch(`${API_URL}/courses/${courseId}/assignments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
}

/**
 * Upload a file
 */
export async function uploadFile(courseId: string, file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    const token = authService.getAccessToken();
    const res = await fetch(`${API_URL}/courses/${courseId}/upload`, {
        method: 'POST',
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: formData
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
}

/**
 * Create a file record (Legacy/Metadata)
 */
export async function createFile(courseId: string, data: { filename: string; file_size: number; mime_type: string; file_path?: string }): Promise<any> {
    const res = await fetch(`${API_URL}/courses/${courseId}/files`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
}

/**
 * Create a new announcement
 */
export async function createAnnouncement(courseId: string, data: { title: string; content: string; priority?: string }): Promise<any> {
    const res = await fetch(`${API_URL}/courses/${courseId}/announcements`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
}

// ========== Update & Delete Operations ==========

export async function updateModule(courseId: string, moduleId: string, data: { title?: string; description?: string; sort_order?: number }): Promise<any> {
    // Note: Backend route might need to be verified, assuming standard REST
    const res = await fetch(`${API_URL}/courses/${courseId}/modules/${moduleId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
}

export async function deleteModule(courseId: string, moduleId: string): Promise<void> {
    const res = await fetch(`${API_URL}/courses/${courseId}/modules/${moduleId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
}

export async function updateAssignment(courseId: string, assignmentId: string, data: any): Promise<any> {
    const res = await fetch(`${API_URL}/courses/${courseId}/assignments/${assignmentId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
    return json.data;
}

export async function deleteAssignment(courseId: string, assignmentId: string): Promise<void> {
    const res = await fetch(`${API_URL}/courses/${courseId}/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
}

export async function deleteLesson(courseId: string, moduleId: string, lessonId: string): Promise<void> {
    const res = await fetch(`${API_URL}/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
}

export async function deleteFile(courseId: string, fileId: string): Promise<void> {
    const res = await fetch(`${API_URL}/courses/${courseId}/files/${fileId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message);
}

export async function updateModuleOrder(courseId: string, modules: { id: string; sort_order: number }[]): Promise<void> {
    // This endpoint might need to be created in backend if not exists, or loop calls
    // For now, we'll assume a bulk update endpoint or loop
    // Let's loop for simplicity if backend doesn't support bulk
    // But ideally backend should have /courses/:id/modules/reorder

    // Using a loop for now as safe fallback
    await Promise.all(modules.map(m => updateModule(courseId, m.id, { sort_order: m.sort_order })));
}
