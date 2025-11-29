import { Router, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { AuthenticatedRequest } from '../middleware/auth';
import { query } from '../config/db';

const router = Router();

// Proxy route for chatbot webhook
router.post('/query', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Extract session and message for logging
    const { sessionId, query: userQuery, attachments } = req.body;
    const userId = req.user?.userId;

    // Create or update chat session
    await query(`
      INSERT INTO chat_sessions(session_token, user_id)
      VALUES ($1, $2)
      ON CONFLICT(session_token) DO UPDATE SET last_activity = CURRENT_TIMESTAMP
    `, [sessionId, userId]);

    // Log user message
    await query(`
      INSERT INTO chat_messages(session_id, sender, text, attachments)
      VALUES (
        (SELECT id FROM chat_sessions WHERE session_token = $1),
        'user', $2, $3
      )
    `, [sessionId, userQuery, attachments ? JSON.stringify(attachments) : null]);

    const webhookUrl = process.env.EXTERNAL_WEBHOOK_URL;

    if (!webhookUrl) {
      return res.status(500).json({
        success: false,
        message: 'Chatbot webhook URL not configured'
      });
    }

    console.log('Sending request to webhook:', webhookUrl);
    console.log('Request payload:', JSON.stringify(req.body, null, 2));

    // Forward the request to the n8n webhook
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(req.body)
    });

    console.log('Webhook response status:', response.status);
    console.log('Webhook response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Webhook error response:', errorText);
      throw new Error(`Webhook responded with status ${response.status}: ${errorText}`);
    }

    const data: any = await response.json();
    console.log('Webhook response data:', data);

    // Log bot message to database
    const botText = Array.isArray(data) && data.every(item => typeof item.text === 'string')
      ? data.map(item => item.text).join('\n\n')
      : data.response || data.message || '';
    await query(
      `INSERT INTO chat_messages(session_id, sender, text, attachments)
       VALUES (
         (SELECT id FROM chat_sessions WHERE session_token = $1),
         'bot', $2, $3
       )`,
      [sessionId, botText, data.attachments ? JSON.stringify(data.attachments) : null]
    );

    return res.json({
      success: true,
      data: data
    });

  } catch (error) {
    console.error('Chatbot webhook error:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

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

// Get messages for a specific session
router.get('/sessions/:sessionId', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user?.userId;

    // Verify session belongs to user
    const sessionCheck = await query(`
      SELECT id FROM chat_sessions 
      WHERE session_token = $1 AND user_id = $2
    `, [sessionId, userId]);

    if (sessionCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or access denied'
      });
    }

    const result = await query(`
      SELECT 
        sender, 
        text, 
        attachments, 
        created_at 
      FROM chat_messages 
      WHERE session_id = $1 AND is_deleted = false
      ORDER BY created_at ASC
    `, [sessionCheck.rows[0].id]);

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