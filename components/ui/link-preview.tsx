import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, Globe, ImageIcon, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface LinkPreviewData {
  title: string;
  description: string;
  image: string;
  site_name: string;
  url: string;
  cached_at: number;
}

interface LinkPreviewProps {
  url: string;
  className?: string;
  showBadge?: boolean;
  compact?: boolean;
}

export function LinkPreview({
  url,
  className = '',
  showBadge = true,
  compact = false
}: LinkPreviewProps) {
  const [previewData, setPreviewData] = useState<LinkPreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/preview?url=${encodeURIComponent(url)}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        setPreviewData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load preview');
        console.error('Link preview error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (url) {
      fetchPreview();
    }
  }, [url]);

  const handleClick = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleImageError = () => {
    setImageError(true);
  };

  if (loading) {
    return (
      <Card className={`w-full max-w-2xl cursor-pointer hover:shadow-lg transition-shadow duration-200 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-center h-24">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            <span className="ml-2 text-sm text-gray-600">Loading preview...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={`w-full max-w-2xl cursor-pointer hover:shadow-lg transition-shadow duration-200 border-red-200 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center text-red-600">
            <Globe className="h-5 w-5 mr-2" />
            <div>
              <p className="text-sm font-medium">Unable to load preview</p>
              <p className="text-xs text-gray-500">{error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!previewData) {
    return null;
  }

  const { title, description, image, site_name } = previewData;

  if (compact) {
    return (
      <Card
        className={`w-full max-w-md cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] ${className}`}
        onClick={handleClick}
      >
        <CardContent className="p-3">
          <div className="flex items-center space-x-3">
            {image && !imageError ? (
              <Image
                src={image}
                alt={title}
                width={48}
                height={48}
                className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                onError={handleImageError}
              />
            ) : (
              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                <ImageIcon className="h-6 w-6 text-gray-400" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium text-sm text-gray-900 truncate">{title}</h3>
              <p className="text-xs text-gray-600 truncate">{site_name}</p>
            </div>
            <ExternalLink className="h-4 w-4 text-gray-400 flex-shrink-0" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`w-full max-w-2xl cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.01] ${className}`}
      onClick={handleClick}
    >
      <CardContent className="p-0">
        <div className="flex">
          {/* Image Section */}
          <div className="w-48 flex-shrink-0">
            {image && !imageError ? (
              <Image
                src={image}
                alt={title}
                width={192}
                height={128}
                className="w-full h-32 object-cover rounded-l-lg"
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-32 bg-gradient-to-br from-blue-50 to-blue-100 rounded-l-lg flex items-center justify-center">
                <ImageIcon className="h-12 w-12 text-blue-300" />
              </div>
            )}
          </div>

          {/* Content Section */}
          <div className="flex-1 p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 text-lg leading-tight line-clamp-2">
                  {title}
                </h3>
                <ExternalLink className="h-4 w-4 text-gray-400 ml-2 flex-shrink-0" />
              </div>

              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {description}
              </p>
            </div>

            <div className="flex items-center justify-between">
              {showBadge && (
                <Badge variant="secondary" className="text-xs">
                  <Globe className="h-3 w-3 mr-1" />
                  {site_name}
                </Badge>
              )}

              <div className="text-xs text-gray-400">
                {new URL(url).hostname}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
