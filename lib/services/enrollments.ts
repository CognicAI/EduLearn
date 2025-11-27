import api from '@/lib/apiClient';

export interface EnrollmentResult {
    email: string;
    status: 'success' | 'failed' | 'skipped' | 'error';
    reason?: string;
    studentName?: string;
}

export interface EnrollmentSummary {
    total: number;
    success: number;
    failed: number;
    skipped: number;
}

export interface BulkEnrollmentResponse {
    success: boolean;
    message: string;
    data: {
        results: EnrollmentResult[];
        summary: EnrollmentSummary;
    };
}

export const enrollStudents = async (courseId: string, emails: string[]): Promise<BulkEnrollmentResponse> => {
    const response = await api.post(`/admin/courses/${courseId}/enrollments`, { emails });
    return response.data;
};

export const getCourseEnrollments = async (courseId: string): Promise<any[]> => {
    const response = await api.get(`/admin/enrollments?course=${courseId}`);
    return response.data.data;
};

export const deleteEnrollments = async (enrollmentIds: string[]): Promise<any> => {
    const response = await api.post('/admin/enrollments/delete', { enrollmentIds });
    return response.data;
};

export const getCourseParticipants = async (courseId: string): Promise<any[]> => {
    const response = await api.get(`/courses/${courseId}/enrollments`);
    return response.data.data;
};

