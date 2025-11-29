// Simple in-memory rate limiter (for production, use Redis)
interface RateLimitEntry {
  count: number;
  resetTime: number;
  tokens: number;
  tokenResetTime: number;
}

const requestStore = new Map<string, RateLimitEntry>();
const CLEANUP_INTERVAL = 60000; // Cleanup every minute

// Cleanup expired entries periodically
setInterval(() => {
  const now = Date.now();
  const keysToDelete: string[] = [];
  requestStore.forEach((entry, key) => {
    if (entry.resetTime < now && entry.tokenResetTime < now) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => requestStore.delete(key));
}, CLEANUP_INTERVAL);

export interface RateLimitConfig {
  requestsPerMinute?: number;
  tokensPerDay?: number;
  windowMs?: number;
  tokenWindowMs?: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  resetTime: number;
  message?: string;
}

export async function checkRateLimit(
  userId: string,
  config: RateLimitConfig = {}
): Promise<RateLimitResult> {
  const {
    requestsPerMinute = 10,
    tokensPerDay = 100000, // 100k tokens per day per user
    windowMs = 60000, // 1 minute
    tokenWindowMs = 86400000, // 24 hours
  } = config;

  const now = Date.now();
  const key = `user:${userId}`;
  
  let entry = requestStore.get(key);

  if (!entry || entry.resetTime < now) {
    entry = {
      count: 0,
      resetTime: now + windowMs,
      tokens: 0,
      tokenResetTime: entry?.tokenResetTime && entry.tokenResetTime > now 
        ? entry.tokenResetTime 
        : now + tokenWindowMs,
    };
    requestStore.set(key, entry);
  }

  // Check request rate limit
  if (entry.count >= requestsPerMinute) {
    return {
      allowed: false,
      limit: requestsPerMinute,
      remaining: 0,
      resetTime: entry.resetTime,
      message: `Rate limit exceeded. Please wait ${Math.ceil((entry.resetTime - now) / 1000)} seconds.`,
    };
  }

  // Increment request count
  entry.count++;

  return {
    allowed: true,
    limit: requestsPerMinute,
    remaining: requestsPerMinute - entry.count,
    resetTime: entry.resetTime,
  };
}

export async function trackTokenUsage(userId: string, tokens: number): Promise<void> {
  const key = `user:${userId}`;
  const entry = requestStore.get(key);
  
  if (entry) {
    entry.tokens += tokens;
  }
}

export async function checkTokenQuota(userId: string, config: RateLimitConfig = {}): Promise<boolean> {
  const { tokensPerDay = 100000 } = config;
  const key = `user:${userId}`;
  const entry = requestStore.get(key);
  
  if (!entry) return true;
  
  return entry.tokens < tokensPerDay;
}

export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': result.limit.toString(),
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
  };
}
