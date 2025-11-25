-- Add type column to course_lessons
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'video';

-- Update existing lessons to be 'video' (default)
UPDATE course_lessons SET type = 'video' WHERE type IS NULL;
