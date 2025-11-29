import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add compression headers for API responses
  // Note: Vercel automatically handles gzip/brotli compression at the edge,
  // but we set headers to indicate support and enable compression for self-hosted deployments
  
  const acceptEncoding = request.headers.get('accept-encoding') || '';
  
  // Check if client supports compression
  if (acceptEncoding.includes('gzip') || acceptEncoding.includes('br')) {
    // Set Vary header to indicate response varies based on Accept-Encoding
    response.headers.set('Vary', 'Accept-Encoding');
  }

  // Add caching headers for static API responses (optional, adjust per route)
  const pathname = request.nextUrl.pathname;
  
  // Cache chatbot sessions list for 60 seconds
  if (pathname.includes('/api/chatbot/sessions') && request.method === 'GET') {
    response.headers.set('Cache-Control', 'private, max-age=60');
  }

  // No cache for chat streaming endpoint
  if (pathname.includes('/api/chat')) {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  }

  return response;
}

// Configure which routes this middleware applies to
export const config = {
  matcher: [
    // Apply to API routes only
    '/api/:path*',
  ],
};
