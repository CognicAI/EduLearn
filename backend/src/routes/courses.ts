import { Router } from 'express';
import { courseController } from '../controllers/courseController';
import { authenticateToken, requireRole } from '../middleware/auth';

import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename: timestamp-originalName
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // 100MB limit
    }
});

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
router.post('/:id/modules/:moduleId/lessons', requireRole(['teacher', 'admin']), courseController.createLesson);
router.post('/:id/assignments', requireRole(['teacher', 'admin']), courseController.createAssignment);
router.post('/:id/files', requireRole(['teacher', 'admin']), courseController.createFile);
router.post('/:id/announcements', requireRole(['teacher', 'admin']), courseController.createAnnouncement);

// File Upload Route
router.post('/:id/upload', requireRole(['teacher', 'admin']), upload.single('file'), courseController.uploadFile);

// Update course content
router.put('/:id/modules/:moduleId', requireRole(['teacher', 'admin']), courseController.updateModule);
router.put('/:id/assignments/:assignmentId', requireRole(['teacher', 'admin']), courseController.updateAssignment);

// Delete course content
router.delete('/:id/modules/:moduleId', requireRole(['teacher', 'admin']), courseController.deleteModule);
router.delete('/:id/modules/:moduleId/lessons/:lessonId', requireRole(['teacher', 'admin']), courseController.deleteLesson);
router.delete('/:id/assignments/:assignmentId', requireRole(['teacher', 'admin']), courseController.deleteAssignment);
router.delete('/:id/files/:fileId', requireRole(['teacher', 'admin']), courseController.deleteFile);

// Create course (Teacher or Admin)
router.post('/', requireRole(['teacher', 'admin']), courseController.createCourse);

// Update course
router.put('/:id', requireRole(['teacher', 'admin']), courseController.updateCourse);

// Delete course
router.delete('/:id', requireRole(['teacher', 'admin']), courseController.deleteCourse);

export default router;
