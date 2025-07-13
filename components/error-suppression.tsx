'use client';

import { useEffect } from 'react';

export function ErrorSuppression() {
  useEffect(() => {
    // Suppress Chrome extension errors that don't affect our app
    const originalError = console.error;
    console.error = (...args) => {
      // Filter out Chrome extension errors
      const message = args[0]?.toString() || '';
      if (
        message.includes('chrome-extension://') ||
        message.includes('Minified React error #299') ||
        message.includes('embed_script.js')
      ) {
        return; // Don't log Chrome extension errors
      }
      originalError.apply(console, args);
    };

    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message = event.reason?.toString() || '';
      if (
        message.includes('chrome-extension://') ||
        message.includes('embed_script.js')
      ) {
        event.preventDefault();
        return;
      }
    };

    // Handle runtime errors
    const handleError = (event: ErrorEvent) => {
      const message = event.message || '';
      const filename = event.filename || '';
      
      if (
        message.includes('chrome-extension://') ||
        filename.includes('chrome-extension://') ||
        filename.includes('embed_script.js')
      ) {
        event.preventDefault();
        return;
      }
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      console.error = originalError;
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return null;
}
