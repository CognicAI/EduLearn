'use client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PHProvider({
    children,
}: {
    children: React.ReactNode
}) {
    useEffect(() => {
        posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY || '', {
            api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
            capture_pageview: false, // Disable automatic pageview capture, as we capture manually
            debug: process.env.NODE_ENV === 'development', // Only enable debug in development
        })
    }, [])

    return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
