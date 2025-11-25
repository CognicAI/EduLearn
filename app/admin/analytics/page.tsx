'use client';

import { useEffect } from 'react';

export default function AnalyticsPage() {
  useEffect(() => {
    window.location.href = 'https://us.posthog.com/';
  }, []);

  return (
    <div className="flex items-center justify-center h-screen bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Redirecting to PostHog Analytics...</p>
      </div>
    </div>
  );
}
