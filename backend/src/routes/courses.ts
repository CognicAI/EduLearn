import { Router } from 'express';
import { courseController } from '../controllers/courseController';
import { authenticateToken, requireRole } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get courses (Teacher sees own, Admin sees all - handled in controller or separate route?)
// For now, let's have a specific route for teacher's courses
router.get('/teacher', requireRole(['teacher', 'admin']), courseController.getTeacherCourses);

// Get categories
router.get('/categories', courseController.getCategories);

// Get course details
router.get('/:id', courseController.getCourseById);

// Get course modules
router.get('/:id/modules', courseController.getCourseModules);

// Get course assignments
router.get('/:id/assignments', courseController.getCourseAssignments);

// Get course files
router.get('/:id/files', courseController.getCourseFiles);

// Get course announcements
router.get('/:id/announcements', courseController.getCourseAnnouncements);

// Create course content
router.post('/:id/modules', requireRole(['teacher', 'admin']), courseController.createModule);
router.post('/:id/assignments', requireRole(['teacher', 'admin']), courseController.createAssignment);
router.post('/:id/files', requireRole(['teacher', 'admin']), courseController.createFile);
router.post('/:id/announcements', requireRole(['teacher', 'admin']), courseController.createAnnouncement);

// Create course (Teacher or Admin)
router.post('/', requireRole(['teacher', 'admin']), courseController.createCourse);

// Update course
router.put('/:id', requireRole(['teacher', 'admin']), courseController.updateCourse);

// Delete course
router.delete('/:id', requireRole(['teacher', 'admin']), courseController.deleteCourse);

export default router;
