import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';

// Simple in-memory cache
const cache = new Map<string, any>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface OpenGraphData {
  title: string;
  description: string;
  image: string;
  site_name: string;
  url: string;
  cached_at: number;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json(
      { error: 'URL parameter is required' },
      { status: 400 }
    );
  }

  try {
    // Validate URL
    new URL(url);
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid URL format' },
      { status: 400 }
    );
  }

  // Check cache
  const cached = cache.get(url);
  if (cached && Date.now() - cached.cached_at < CACHE_DURATION) {
    return NextResponse.json(cached);
  }

  try {
    // Scrape Open Graph metadata
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; EduLearn LinkPreview/1.0)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    const $ = cheerio.load(response.data);

    // Extract Open Graph metadata
    const ogData: OpenGraphData = {
      title: 
        $('meta[property="og:title"]').attr('content') ||
        $('meta[name="twitter:title"]').attr('content') ||
        $('title').text() ||
        'No title available',
      description:
        $('meta[property="og:description"]').attr('content') ||
        $('meta[name="twitter:description"]').attr('content') ||
        $('meta[name="description"]').attr('content') ||
        'No description available',
      image:
        $('meta[property="og:image"]').attr('content') ||
        $('meta[name="twitter:image"]').attr('content') ||
        $('meta[property="og:image:url"]').attr('content') ||
        '',
      site_name:
        $('meta[property="og:site_name"]').attr('content') ||
        $('meta[name="application-name"]').attr('content') ||
        new URL(url).hostname,
      url: url,
      cached_at: Date.now(),
    };

    // Ensure image URL is absolute
    if (ogData.image && !ogData.image.startsWith('http')) {
      const baseUrl = new URL(url);
      ogData.image = new URL(ogData.image, baseUrl.origin).toString();
    }

    // Cache the result
    cache.set(url, ogData);

    return NextResponse.json(ogData);
  } catch (error) {
    console.error('Error fetching URL preview:', error);
    
    // Return fallback data
    const fallbackData: OpenGraphData = {
      title: 'Unable to load preview',
      description: 'Could not fetch preview data for this URL',
      image: '',
      site_name: new URL(url).hostname,
      url: url,
      cached_at: Date.now(),
    };

    return NextResponse.json(fallbackData, { status: 200 });
  }
}

// Optional: Add cache cleanup
setInterval(() => {
  const now = Date.now();
  Array.from(cache.entries()).forEach(([key, value]) => {
    if (now - value.cached_at > CACHE_DURATION) {
      cache.delete(key);
    }
  });
}, CACHE_DURATION);
