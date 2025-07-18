"use client";

import { LinkPreview } from '@/components/ui/link-preview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, Youtube, Github, Twitter } from 'lucide-react';

export default function LinkPreviewDemo() {
  const demoUrls = [
    {
      url: 'https://edulearn.studio',
      title: 'EduLearn (Our Site)',
      icon: <Globe className="h-4 w-4" />,
      color: 'bg-blue-500'
    },
    {
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      title: 'YouTube Video',
      icon: <Youtube className="h-4 w-4" />,
      color: 'bg-red-500'
    },
    {
      url: 'https://github.com/vercel/next.js',
      title: 'GitHub Repository',
      icon: <Github className="h-4 w-4" />,
      color: 'bg-gray-800'
    },
    {
      url: 'https://twitter.com/vercel',
      title: 'Twitter Profile',
      icon: <Twitter className="h-4 w-4" />,
      color: 'bg-blue-400'
    },
    {
      url: 'https://invalid-url-example.com',
      title: 'Invalid URL (Error Demo)',
      icon: <Globe className="h-4 w-4" />,
      color: 'bg-red-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 Link Preview Component Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            YouTube-style link previews with Open Graph metadata scraping, 
            caching, and beautiful Tailwind CSS styling.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-lg">🧠 Smart Scraping</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                Extracts Open Graph metadata using cheerio and axios with fallback support
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-lg">💾 Intelligent Caching</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                In-memory cache with 5-minute TTL reduces API calls and improves performance
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-lg">🎨 Beautiful Design</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 text-center">
                Responsive cards with hover effects, loading states, and error handling
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Regular Layout Demo */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Regular Layout</h2>
          <div className="space-y-6">
            {demoUrls.map((demo, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center space-x-2">
                  <div className={`p-1 rounded ${demo.color} text-white`}>
                    {demo.icon}
                  </div>
                  <span className="font-medium text-gray-700">{demo.title}</span>
                  <Badge variant="outline" className="text-xs">
                    {demo.url}
                  </Badge>
                </div>
                <LinkPreview url={demo.url} />
              </div>
            ))}
          </div>
        </div>

        {/* Compact Layout Demo */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Compact Layout</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {demoUrls.map((demo, index) => (
              <LinkPreview 
                key={index} 
                url={demo.url} 
                compact={true}
                showBadge={false}
              />
            ))}
          </div>
        </div>

        {/* API Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">🔧 API Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Backend API Endpoint</h3>
                <code className="bg-gray-100 p-2 rounded text-sm block">
                  GET /api/preview?url=https://example.com
                </code>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">React Component Usage</h3>
                <code className="bg-gray-100 p-2 rounded text-sm block">
                  {`<LinkPreview url="https://edulearn.studio" />`}
                </code>
              </div>
              
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Props</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li><code>url</code> - The URL to preview (required)</li>
                  <li><code>className</code> - Additional CSS classes</li>
                  <li><code>showBadge</code> - Show site name badge (default: true)</li>
                  <li><code>compact</code> - Use compact layout (default: false)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
