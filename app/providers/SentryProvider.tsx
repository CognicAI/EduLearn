'use client';

import { useEffect } from 'react';
import * as Sentry from '@sentry/nextjs';

export function SentryProvider({ children }: { children: React.ReactNode }) {
    useEffect(() => {
        // Sentry is auto-initialized via next.config.js
        // This component can be used for additional client-side configuration
        if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
            Sentry.setContext('app', {
                environment: process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT || process.env.NODE_ENV,
            });
        }
    }, []);

    return <>{children}</>;
}
