import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Proxy route for chatbot webhook
router.post('/query', authenticateToken, async (req: Request, res: Response) => {
  try {
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

    const data = await response.json();
    console.log('Webhook response data:', data);
    
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