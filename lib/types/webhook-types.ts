export interface WebhookRequest {
    question: string;
    sessionId: string;
    userProfile: {
        role: string;
        learningStyle: string;
    };
}

export interface WebhookResponse {
    // The webhook returns a direct JSON array of query results
    results: any[];
}

export interface WebhookConfig {
    url: string;
    timeout: number;
}
