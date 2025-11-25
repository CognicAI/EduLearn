-- Add parent_id to course_modules table to support nesting
ALTER TABLE course_modules ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES course_modules(id) ON DELETE CASCADE;
