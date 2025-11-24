import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

export const initSentry = () => {
    Sentry.init({
        dsn: process.env.SENTRY_DSN,
        environment: process.env.SENTRY_ENVIRONMENT || process.env.NODE_ENV || 'development',

        // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
        // Adjust this value in production
        tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

        // Set sampling rate for profiling - this is relative to tracesSampleRate
        profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

        integrations: [
            // Add profiling integration
            nodeProfilingIntegration(),
        ],

        // Only enable Sentry if DSN is configured
        enabled: !!process.env.SENTRY_DSN,

        // Don't send any PII (Personally Identifiable Information) to Sentry
        beforeSend(event, hint) {
            // Filter out certain errors if needed
            if (event.exception) {
                const error = hint.originalException as Error;
                // Don't send validation errors to Sentry
                if (error?.message?.includes('Validation')) {
                    return null;
                }
            }
            return event;
        },
    });
};

export { Sentry };
