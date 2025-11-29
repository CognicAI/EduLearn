import { GoogleGenerativeAI } from '@google/generative-ai';
import { generateSystemPrompt, NeuroProfile } from '@/lib/neuro-prompts';

// Ensure API key is present
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || '');

export const runtime = 'nodejs'; // Switch to nodejs runtime to avoid potential edge streaming issues

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

        // Create a new stream that logs the full response when done
        const stream = new ReadableStream({
            async start(controller) {
                const encoder = new TextEncoder();
                let fullResponse = '';

                try {
                    for await (const chunk of result.stream) {
                        const text = chunk.text();
                        if (text) {
                            fullResponse += text;
                            controller.enqueue(encoder.encode(text));
                        }
                    }

                    // Log bot response asynchronously
                    if (sessionId && fullResponse) {
                        logToBackend(sessionId, 'bot', fullResponse, null, req.headers.get('Authorization') || '')
                            .catch(err => console.error('Failed to log bot message:', err));
                    }

                    controller.close();
                } catch (e) {
                    console.error('Stream error:', e);
                    controller.error(e);
                }
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
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
