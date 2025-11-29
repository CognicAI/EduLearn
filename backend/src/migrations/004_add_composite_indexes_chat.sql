-- Migration: Add composite indexes for chat performance optimization
-- Created: 2025-11-29
-- Description: Adds composite indexes to optimize common query patterns for chat sessions and messages

-- Drop existing single-column indexes that will be replaced by composite indexes
DROP INDEX IF EXISTS idx_chat_sessions_user_id;
DROP INDEX IF EXISTS idx_chat_sessions_deleted;

-- Composite index for listing user's active sessions sorted by last activity
-- Covers the query: WHERE user_id = ? AND is_deleted = false ORDER BY last_activity DESC
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_active_time 
  ON chat_sessions(user_id, is_deleted, last_activity DESC);

-- Composite index for fetching messages of a session
-- Covers the query: WHERE session_id = ? AND is_deleted = false ORDER BY created_at ASC
CREATE INDEX IF NOT EXISTS idx_chat_messages_session_active_time
  ON chat_messages(session_id, is_deleted, created_at ASC);

-- Index for date range analytics queries
CREATE INDEX IF NOT EXISTS idx_chat_sessions_date_range
  ON chat_sessions(started_at)
  WHERE is_deleted = false;

-- Index for counting user's total sessions
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_count
  ON chat_sessions(user_id)
  WHERE is_deleted = false;

-- Add comments to document the indexes
COMMENT ON INDEX idx_chat_sessions_user_active_time IS 
  'Composite index for fetching user active sessions sorted by last activity';
COMMENT ON INDEX idx_chat_messages_session_active_time IS 
  'Composite index for fetching session messages in chronological order';
COMMENT ON INDEX idx_chat_sessions_date_range IS 
  'Index for analytics queries filtering by date range';
COMMENT ON INDEX idx_chat_sessions_user_count IS 
  'Index for counting user sessions efficiently';

-- Analyze tables to update query planner statistics
ANALYZE chat_sessions;
ANALYZE chat_messages;

-- Query to verify indexes were created successfully
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public' 
  AND tablename IN ('chat_sessions', 'chat_messages')
ORDER BY tablename, indexname;
