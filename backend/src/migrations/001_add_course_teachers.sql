-- Migration: Add course_teachers table for teacher-course assignments
-- Date: 2025-11-24
-- Description: Allows admins to assign teachers to courses they didn't create

-- Create course_teachers junction table
CREATE TABLE IF NOT EXISTS course_teachers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    teacher_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assigned_by UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    can_edit BOOLEAN DEFAULT true,
    can_delete BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, teacher_id)
);

-- Add check constraint to ensure teacher_id refers to a user with teacher role
-- Note: This is enforced at the application level for flexibility

-- Create indexes for performance
CREATE INDEX idx_course_teachers_course ON course_teachers(course_id);
CREATE INDEX idx_course_teachers_teacher ON course_teachers(teacher_id);
CREATE INDEX idx_course_teachers_assigned_by ON course_teachers(assigned_by);

-- Add comment for documentation
COMMENT ON TABLE course_teachers IS 'Junction table for assigning teachers to courses by admins';
COMMENT ON COLUMN course_teachers.can_edit IS 'Whether assigned teacher can edit the course';
COMMENT ON COLUMN course_teachers.can_delete IS 'Whether assigned teacher can delete the course';
COMMENT ON COLUMN course_teachers.notes IS 'Optional notes about the assignment';
