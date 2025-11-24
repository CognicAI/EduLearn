import { Router } from 'express';
import { adminController } from '../controllers/adminController';
import { adminAnalyticsController } from '../controllers/adminAnalyticsController';
import { adminCourseController } from '../controllers/adminCourseController';
import { adminEnrollmentController } from '../controllers/adminEnrollmentController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// All routes require admin authentication
router.use(authenticateToken, requireRole(['admin']));

// ===== ANALYTICS ROUTES =====
router.get('/analytics/platform', adminAnalyticsController.getPlatformStats);
router.get('/analytics/users', adminAnalyticsController.getUserAnalytics);
router.get('/analytics/courses', adminAnalyticsController.getCourseAnalytics);
router.get('/analytics/financial', adminAnalyticsController.getFinancialAnalytics);
router.get('/analytics/system', adminAnalyticsController.getSystemHealth);

// ===== USER MANAGEMENT ROUTES =====
// List and filter users
router.get('/users', adminController.getUsers);
router.get('/users/new', adminController.getNewUserForm);

// Get single user details
router.get('/users/:id', adminController.getUserById);

// Create new user
router.post('/users', adminController.createUser);

// Update user
router.put('/users/:id', adminController.updateUser);

// Delete user (soft delete)
router.delete('/users/:id', adminController.deleteUser);

// Bulk operations
router.post('/users/bulk/delete', adminController.bulkDeleteUsers);
router.post('/users/bulk/update-status', adminController.bulkUpdateUserStatus);
router.post('/users/bulk/import', adminController.bulkImportUsers);

// Export users
router.get('/users/export/csv', adminController.exportUsers);

// ===== COURSE MANAGEMENT ROUTES =====
// List and filter courses
router.get('/courses', adminCourseController.getCourses);

// Get single course details
router.get('/courses/:id', adminCourseController.getCourseById);

// Create new course
router.post('/courses', adminCourseController.createCourse);

// Update course
router.put('/courses/:id', adminCourseController.updateCourse);

// Delete course (soft delete)
router.delete('/courses/:id', adminCourseController.deleteCourse);

// Bulk operations
router.post('/courses/bulk/update-status', adminCourseController.bulkUpdateCourseStatus);
router.post('/courses/bulk/delete', adminCourseController.bulkDeleteCourses);

// ===== TEACHER ASSIGNMENT ROUTES =====
// Assign teachers to a course
router.post('/courses/:id/teachers', adminCourseController.assignTeachersToCourse);

// Get all teachers assigned to a course
router.get('/courses/:id/teachers', adminCourseController.getCourseTeachers);

// Remove a teacher from a course
router.delete('/courses/:id/teachers/:teacherId', adminCourseController.removeTeacherFromCourse);

// ===== ENROLLMENT MANAGEMENT ROUTES =====
// List and filter enrollments
router.get('/enrollments', adminEnrollmentController.getEnrollments);

// Get single enrollment details
router.get('/enrollments/:id', adminEnrollmentController.getEnrollmentById);

// Update enrollment
router.put('/enrollments/:id', adminEnrollmentController.updateEnrollment);

// Issue certificate
router.post('/enrollments/:id/certificate', adminEnrollmentController.issueCertificate);

// Export enrollments
router.get('/enrollments/export/csv', adminEnrollmentController.exportEnrollments);

export default router;

