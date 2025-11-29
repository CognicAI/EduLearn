import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateSystemPrompt, NeuroProfile } from '@/lib/neuro-prompts';
import { checkRateLimit, trackTokenUsage, checkTokenQuota, getRateLimitHeaders } from '@/lib/rate-limit';
import { jwtVerify } from 'jose';

// Ensure API key is present
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

export const runtime = 'nodejs'; // Switch to nodejs runtime to avoid potential edge streaming issues

// Helper to verify JWT token
async function verifyToken(authHeader: string | null): Promise<{ userId: string } | null> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.substring(7);
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'your-jwt-secret-key');

    try {
        const { payload } = await jwtVerify(token, secret);
        return { userId: payload.userId as string };
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}

// Simple iterator to stream adapter
function GeminiStream(stream: AsyncGenerator<any, any, unknown>) {
    const encoder = new TextEncoder();
    return new ReadableStream({
        async start(controller) {
            try {
                for await (const chunk of stream) {
                    try {
                        const text = chunk.text();
                        if (text) {
                            controller.enqueue(encoder.encode(text));
                        }
                    } catch (chunkError) {
                        console.error('Error parsing chunk:', chunkError);
                        // Continue to next chunk if one fails
                    }
                }
                controller.close();
            } catch (e) {
                console.error('Stream error:', e);
                controller.error(e);
            }
        },
    });
}

export async function POST(req: Request) {
    let sessionId: string | undefined;
    let userMessageText = '';
    let userAttachments: any[] = [];

    try {
        // Verify authentication
        const authHeader = req.headers.get('Authorization');
        const user = await verifyToken(authHeader);
        
        if (!user) {
            return new Response(JSON.stringify({ error: 'Unauthorized. Please log in.' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Check rate limit
        const rateLimitResult = await checkRateLimit(user.userId, {
            requestsPerMinute: 10,
            tokensPerDay: 100000
        });

        if (!rateLimitResult.allowed) {
            return new Response(JSON.stringify({
                error: rateLimitResult.message || 'Rate limit exceeded',
                resetTime: rateLimitResult.resetTime
            }), {
                status: 429,
                headers: {
                    'Content-Type': 'application/json',
                    ...getRateLimitHeaders(rateLimitResult)
                }
            });
        }

        // Check token quota
        const hasQuota = await checkTokenQuota(user.userId);
        if (!hasQuota) {
            return new Response(JSON.stringify({
                error: 'Daily token quota exceeded. Please try again tomorrow.'
            }), {
                status: 429,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const { messages, userProfile, sessionId: reqSessionId } = await req.json();
        sessionId = reqSessionId;

        if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
            return new Response('Missing GOOGLE_GENERATIVE_AI_API_KEY environment variable', { status: 500 });
        }

        const { role, learningStyle } = userProfile as NeuroProfile;
        const systemPrompt = generateSystemPrompt(role, learningStyle);

        // Using gemini-2.0-flash model with system instruction
        const model = genAI.getGenerativeModel({
            model: 'gemini-2.0-flash',
            systemInstruction: systemPrompt
        });

        // Convert messages to Gemini format and merge consecutive messages
        const rawHistory = messages.slice(0, -1).map((m: any) => {
            const parts = [];
            if (m.content) parts.push({ text: m.content });
            if (m.attachments) {
                m.attachments.forEach((att: any) => {
                    if (att.base64) {
                        parts.push({
                            inlineData: {
                                data: att.base64,
                                mimeType: att.type
                            }
                        });
                    }
                });
            }
            return {
                role: m.role === 'user' ? 'user' : 'model',
                parts: parts,
            };
        }).filter((m: any) => m.parts.length > 0);

        const history = [];
        for (const msg of rawHistory) {
            if (history.length > 0 && history[history.length - 1].role === msg.role) {
                // Merge with previous message
                history[history.length - 1].parts.push(...msg.parts);
            } else {
                history.push(msg);
            }
        }

        // Ensure history starts with a user message
        while (history.length > 0 && history[0].role !== 'user') {
            history.shift();
        }

        // Get the last message (current user message)
        const lastMessage = messages[messages.length - 1];
        const lastMessageParts = [];

        if (lastMessage.content) {
            lastMessageParts.push({ text: lastMessage.content });
            userMessageText = lastMessage.content;
        }

        if (lastMessage.attachments && lastMessage.attachments.length > 0) {
            userAttachments = lastMessage.attachments;
            lastMessage.attachments.forEach((att: any) => {
                if (att.base64) {
                    lastMessageParts.push({
                        inlineData: {
                            data: att.base64,
                            mimeType: att.type
                        }
                    });
                }
            });
        }

        if (lastMessageParts.length === 0) {
            return new Response(JSON.stringify({ error: 'Message cannot be empty' }), { status: 400 });
        }

        // Log user message asynchronously
        if (sessionId) {
            logToBackend(sessionId, 'user', userMessageText || (userAttachments.length > 0 ? 'Sent attachments' : ''), userAttachments, req.headers.get('Authorization') || '')
                .catch(err => console.error('Failed to log user message:', err));
        }

        const chat = model.startChat({
            history: history,
            generationConfig: {
                maxOutputTokens: 4000,
            },
        });

        const result = await chat.sendMessageStream(lastMessageParts);

        // Create a new stream with error recovery
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                let fullResponse = '';
                let retryCount = 0;
                const MAX_RETRIES = 2;
                
                const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
                
                const isRetryableError = (error: any): boolean => {
                    const message = error?.message?.toLowerCase() || '';
                    return (
                        message.includes('network') ||
                        message.includes('timeout') ||
                        message.includes('econnreset') ||
                        error?.status === 503 ||
                        error?.status === 429
                    );
                };

                const attemptStream = async (): Promise<boolean> => {
                    try {
                        for await (const chunk of result.stream) {
                            const text = chunk.text();
                            if (text) {
                                fullResponse += text;
                                controller.enqueue(encoder.encode(text));
                            }
                        }
                        return true;
                    } catch (e: any) {
                        console.error(`Stream error (attempt ${retryCount + 1}):`, e);
                        
                        if (retryCount < MAX_RETRIES && isRetryableError(e)) {
                            retryCount++;
                            const backoffMs = 1000 * Math.pow(2, retryCount - 1); // Exponential backoff
                            
                            const retryMsg = `\n\n_[Connection interrupted. Retrying (${retryCount}/${MAX_RETRIES})...]_\n\n`;
                            controller.enqueue(encoder.encode(retryMsg));
                            
                            await sleep(backoffMs);
                            return attemptStream();
                        }
                        
                        // Failed all retries or non-retryable error
                        const errorMsg = '\n\n_[Unable to complete response. Please try sending your message again.]_';
                        controller.enqueue(encoder.encode(errorMsg));
                        throw e;
                    }
                };

                try {
                    await attemptStream();
                    
                    // Track token usage (approximate: 1 token ≈ 4 chars)
                    const estimatedTokens = Math.ceil(
                        (userMessageText.length + fullResponse.length) / 4
                    );
                    await trackTokenUsage(user.userId, estimatedTokens);

                    // Log bot response asynchronously
                    if (sessionId && fullResponse) {
                        logToBackend(sessionId, 'bot', fullResponse, null, req.headers.get('Authorization') || '')
                            .catch(err => console.error('Failed to log bot message:', err));
                    }

                    controller.close();
                } catch (e) {
                    console.error('Final stream error:', e);
                    controller.error(e);
                }
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                ...getRateLimitHeaders(rateLimitResult),
            },
        });

    } catch (error: any) {
        console.error('Error in chat route:', error);
        return new Response(JSON.stringify({
            error: 'An error occurred processing your request',
            details: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Helper function to log to backend
async function logToBackend(sessionId: string, sender: 'user' | 'bot', text: string, attachments: any, authHeader: string) {
    try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
        await fetch(`${backendUrl}/chatbot/log`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': authHeader
            },
            body: JSON.stringify({
                sessionId,
                sender,
                text,
                attachments
            })
        });
    } catch (error) {
        console.error('Error logging to backend:', error);
    }
}
