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

export default router;