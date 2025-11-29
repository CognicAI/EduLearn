import { Router, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { AuthenticatedRequest } from '../middleware/auth';
import { query } from '../config/db';

const router = Router();

// Logging endpoint for chat sessions and messages
router.post('/log', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId, sender, text, attachments, metadata } = req.body;
    const userId = req.user?.userId;

    if (!sessionId || !sender || !text) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: sessionId, sender, text'
      });
    }

    // Create or update chat session
    await query(`
      INSERT INTO chat_sessions(session_token, user_id, metadata)
      VALUES ($1, $2, $3)
      ON CONFLICT(session_token) DO UPDATE SET 
        last_activity = CURRENT_TIMESTAMP,
        metadata = COALESCE(chat_sessions.metadata::jsonb, '{}'::jsonb) || COALESCE($3::jsonb, '{}'::jsonb)
    `, [sessionId, userId, metadata ? JSON.stringify(metadata) : null]);

    // Log message
    await query(`
      INSERT INTO chat_messages(session_id, sender, text, attachments)
      VALUES (
        (SELECT id FROM chat_sessions WHERE session_token = $1),
        $2, $3, $4
      )
    `, [sessionId, sender, text, attachments ? JSON.stringify(attachments) : null]);

    return res.json({ success: true });

  } catch (error) {
    console.error('Chat logging error:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// Get all chat sessions for the user
router.get('/sessions', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    const result = await query(`
      SELECT 
        id, 
        session_token, 
        started_at, 
        last_activity, 
        summary, 
        metadata 
      FROM chat_sessions 
      WHERE user_id = $1 AND is_deleted = false
      ORDER BY last_activity DESC
    `, [userId]);

    return res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching chat sessions:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get messages for a specific session with pagination
router.get('/sessions/:sessionId/messages', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.userId;
    
    // Pagination parameters
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100); // Max 100 messages per request
    const cursor = req.query.cursor as string | undefined; // Message ID cursor
    const direction = (req.query.direction as string) === 'after' ? 'after' : 'before'; // Load before or after cursor

    // Optimize query: exclude base64 data from attachments to reduce payload size
    // Problem: 23 messages = 6.9MB response due to base64-encoded files in attachments
    // Solution: Strip base64 field, keep only metadata (name, size, type, url)
    let messagesQuery = `
      SELECT 
        cm.id,
        cm.sender, 
        cm.text,
        -- Strip base64 data from attachments to reduce response size dramatically
        CASE 
          WHEN cm.attachments IS NOT NULL AND json_typeof(cm.attachments) = 'array' THEN
            (
              SELECT json_agg(
                json_build_object(
                  'name', elem->>'name',
                  'size', elem->>'size',
                  'type', elem->>'type',
                  'url', elem->>'url'
                )
              )
              FROM json_array_elements(cm.attachments) elem
            )
          ELSE cm.attachments
        END as attachments,
        cm.created_at 
      FROM chat_messages cm
      INNER JOIN chat_sessions cs ON cm.session_id = cs.id
      WHERE cs.session_token = $1 
        AND cs.user_id = $2 
        AND cs.is_deleted = false
        AND cm.is_deleted = false
    `;

    const params: any[] = [sessionId, userId];

    // Add cursor condition if provided
    if (cursor) {
      const cursorId = parseInt(cursor);
      if (isNaN(cursorId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid cursor value'
        });
      }
      params.push(cursorId);
      messagesQuery += direction === 'before' 
        ? ` AND cm.id < $${params.length}`
        : ` AND cm.id > $${params.length}`;
    }

    // Order and limit
    messagesQuery += ` ORDER BY cm.created_at ${direction === 'before' ? 'DESC' : 'ASC'} LIMIT $${params.length + 1}`;
    params.push(limit);

    const result = await query(messagesQuery, params);

    // Reverse results if fetching before cursor (to maintain chronological order)
    const messages = direction === 'before' ? result.rows.reverse() : result.rows;

    // Determine if there are more messages
    const hasMore = result.rows.length === limit;
    const nextCursor = hasMore && messages.length > 0 
      ? messages[messages.length - 1].id 
      : null;
    const prevCursor = messages.length > 0 
      ? messages[0].id 
      : null;

    return res.json({
      success: true,
      data: messages,
      pagination: {
        hasMore,
        nextCursor,
        prevCursor,
        limit
      }
    });
  } catch (error) {
    console.error('Error fetching paginated chat messages:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get messages for a specific session (legacy - kept for backward compatibility)
router.get('/sessions/:sessionId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.userId;

    // Optimized: Single query with JOIN instead of two sequential queries
    // Also strip base64 data from attachments to reduce payload size
    const result = await query(`
      SELECT 
        cm.sender, 
        cm.text,
        -- Strip base64 data to avoid sending 6.9MB for 23 messages
        CASE 
          WHEN cm.attachments IS NOT NULL AND json_typeof(cm.attachments) = 'array' THEN
            (
              SELECT json_agg(
                json_build_object(
                  'name', elem->>'name',
                  'size', elem->>'size',
                  'type', elem->>'type',
                  'url', elem->>'url'
                )
              )
              FROM json_array_elements(cm.attachments) elem
            )
          ELSE cm.attachments
        END as attachments,
        cm.created_at 
      FROM chat_messages cm
      INNER JOIN chat_sessions cs ON cm.session_id = cs.id
      WHERE cs.session_token = $1 
        AND cs.user_id = $2 
        AND cs.is_deleted = false
        AND cm.is_deleted = false
      ORDER BY cm.created_at ASC
    `, [sessionId, userId]);

    if (result.rows.length === 0) {
      // Check if session exists but has no messages or doesn't exist/access denied
      const sessionExists = await query(`
        SELECT id FROM chat_sessions 
        WHERE session_token = $1 AND user_id = $2 AND is_deleted = false
      `, [sessionId, userId]);

      if (sessionExists.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Session not found or access denied'
        });
      }
      
      // Session exists but has no messages
      return res.json({
        success: true,
        data: []
      });
    }

    return res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete a chat session (soft delete)
router.delete('/sessions/:sessionId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.userId;

    // Verify session belongs to user and delete it
    const result = await query(`
      UPDATE chat_sessions 
      SET is_deleted = true, deleted_at = CURRENT_TIMESTAMP
      WHERE session_token = $1 AND user_id = $2
      RETURNING id
    `, [sessionId, userId]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or access denied'
      });
    }

    return res.json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting chat session:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;