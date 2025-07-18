"use client";

import { LinkPreview } from '@/components/ui/link-preview';

export default function LinkPreviewTest() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Link Preview Test</h1>
        
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Regular Layout</h2>
            <LinkPreview url="https://edulearn.studio" />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Compact Layout</h2>
            <LinkPreview url="https://edulearn.studio" compact={true} />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">GitHub Example</h2>
            <LinkPreview url="https://github.com/vercel/next.js" />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Error Handling (Invalid URL)</h2>
            <LinkPreview url="https://invalid-url-example-404.com" />
          </div>
        </div>
      </div>
    </div>
  );
}
