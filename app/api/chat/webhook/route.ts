import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

// Helper to verify JWT token and check admin role
async function verifyAdminToken(authHeader: string | null): Promise<{ userId: string; role: string } | null> {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
    }

    const token = authHeader.substring(7);
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is not set');
    }
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);

    try {
        const { payload } = await jwtVerify(token, secret);
        return {
            userId: payload.userId as string,
            role: payload.role as string
        };
    } catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
}

export async function POST(req: NextRequest) {
    try {
        // Verify authentication and admin role
        const authHeader = req.headers.get('Authorization');
        const user = await verifyAdminToken(authHeader);

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized. Please log in.' },
                { status: 401 }
            );
        }

        // Check if user is admin
        if (user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Forbidden. This feature is only available to administrators.' },
                { status: 403 }
            );
        }

        const { question, sessionId, userProfile } = await req.json();

        if (!question || !question.trim()) {
            return NextResponse.json(
                { error: 'Question cannot be empty' },
                { status: 400 }
            );
        }

        // Get webhook configuration
        const webhookUrl = process.env.N8N_WEBHOOK_URL ||
            'https://harsha23eg105e29.app.n8n.cloud/webhook-test/edulearn';
        const webhookTimeout = parseInt(process.env.N8N_WEBHOOK_TIMEOUT || '30000');

        // Prepare webhook request with query parameter
        const queryParam = encodeURIComponent(question.trim());
        const webhookUrlWithQuery = `${webhookUrl}?query=${queryParam}`;

        console.log('Sending GET request to webhook:', webhookUrlWithQuery);

        // Call the n8n webhook with GET method
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), webhookTimeout);

        try {
            const webhookResponse = await fetch(webhookUrlWithQuery, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (!webhookResponse.ok) {
                throw new Error(`Webhook returned status ${webhookResponse.status}`);
            }

            // Parse the response - expecting a JSON array
            const results = await webhookResponse.json();

            // Format the results as a readable message
            let formattedMessage = '';

            if (Array.isArray(results) && results.length > 0) {
                // Create a formatted table-like response
                formattedMessage = `**Query Results** (${results.length} rows):\n\n`;

                // Get column names from first object
                const columns = Object.keys(results[0]);

                // Create markdown table
                formattedMessage += '| ' + columns.join(' | ') + ' |\n';
                formattedMessage += '| ' + columns.map(() => '---').join(' | ') + ' |\n';

                // Add rows (limit to first 50 for display)
                const displayLimit = Math.min(results.length, 50);
                for (let i = 0; i < displayLimit; i++) {
                    const row = results[i];
                    formattedMessage += '| ' + columns.map(col => row[col] || '').join(' | ') + ' |\n';
                }

                if (results.length > displayLimit) {
                    formattedMessage += `\n_...and ${results.length - displayLimit} more rows_`;
                }
            } else if (Array.isArray(results) && results.length === 0) {
                formattedMessage = '**Query executed successfully.** No results returned.';
            } else {
                formattedMessage = '**Query executed successfully.**\n\n```json\n' +
                    JSON.stringify(results, null, 2) + '\n```';
            }

            // Return the formatted message
            return NextResponse.json({
                success: true,
                message: formattedMessage,
                rawResults: results,
                resultCount: Array.isArray(results) ? results.length : 0
            });

        } catch (fetchError: any) {
            clearTimeout(timeoutId);

            if (fetchError.name === 'AbortError') {
                return NextResponse.json(
                    {
                        error: 'Webhook request timed out. The query may be taking too long to execute.',
                        details: 'Please try a simpler query or contact your administrator.'
                    },
                    { status: 504 }
                );
            }

            throw fetchError;
        }

    } catch (error: any) {
        console.error('Error in webhook route:', error);
        return NextResponse.json(
            {
                error: 'Failed to process webhook request',
                details: error.message
            },
            { status: 500 }
        );
    }
}
