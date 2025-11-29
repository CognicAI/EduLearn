-- Migration: Add learning_style column to users table
-- Created: 2025-11-29
-- Description: Adds learning_style field to support neuro-adaptive AI personalization

-- Add learning_style column to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS learning_style VARCHAR(20) 
  CHECK (learning_style IN ('ADHD', 'Dyslexia', 'Anxiety', 'General'));

-- Add index for query performance on learning_style
CREATE INDEX IF NOT EXISTS idx_users_learning_style 
  ON users(learning_style) 
  WHERE learning_style IS NOT NULL;

-- Set default value for existing users
UPDATE users 
SET learning_style = 'General' 
WHERE learning_style IS NULL;

-- Add comment to document the column
COMMENT ON COLUMN users.learning_style IS 'Learning style preference for neuro-adaptive AI personalization (ADHD, Dyslexia, Anxiety, General)';

-- Verify the migration
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'users' 
  AND column_name = 'learning_style';
