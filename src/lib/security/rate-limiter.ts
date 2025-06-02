interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  keyGenerator?: (identifier: string) => string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
  firstRequest: number;
}

export class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = config;
    
    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Check if a request should be rate limited
   * @param identifier - Unique identifier (user ID, IP, etc.)
   * @returns { allowed: boolean, remaining: number, resetTime: number }
   */
  checkLimit(identifier: string): { allowed: boolean; remaining: number; resetTime: number; retryAfter?: number } {
    const key = this.config.keyGenerator ? this.config.keyGenerator(identifier) : identifier;
    const now = Date.now();
    
    let entry = this.store.get(key);
    
    // If no entry exists or window has expired, create new entry
    if (!entry || now >= entry.resetTime) {
      entry = {
        count: 1,
        resetTime: now + this.config.windowMs,
        firstRequest: now
      };
      this.store.set(key, entry);
      
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: entry.resetTime
      };
    }
    
    // Check if limit exceeded
    if (entry.count >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: entry.resetTime,
        retryAfter: Math.ceil((entry.resetTime - now) / 1000)
      };
    }
    
    // Increment count
    entry.count++;
    this.store.set(key, entry);
    
    return {
      allowed: true,
      remaining: this.config.maxRequests - entry.count,
      resetTime: entry.resetTime
    };
  }

  /**
   * Reset rate limit for a specific identifier
   * @param identifier - Unique identifier to reset
   */
  reset(identifier: string): void {
    const key = this.config.keyGenerator ? this.config.keyGenerator(identifier) : identifier;
    this.store.delete(key);
  }

  /**
   * Get current status for an identifier
   * @param identifier - Unique identifier
   * @returns Current rate limit status
   */
  getStatus(identifier: string): { count: number; remaining: number; resetTime: number } | null {
    const key = this.config.keyGenerator ? this.config.keyGenerator(identifier) : identifier;
    const entry = this.store.get(key);
    
    if (!entry) {
      return null;
    }
    
    return {
      count: entry.count,
      remaining: Math.max(0, this.config.maxRequests - entry.count),
      resetTime: entry.resetTime
    };
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.store.forEach((entry, key) => {
      if (now >= entry.resetTime) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.store.delete(key));
  }
}

// Pre-configured rate limiters for different use cases
export const rateLimiters = {
  // General API requests - 100 requests per minute
  api: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100
  }),

  // Authentication requests - 5 attempts per 15 minutes
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5
  }),

  // Message sending - 30 messages per minute
  messaging: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 30
  }),

  // AI content generation - 20 requests per minute
  aiGeneration: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20
  }),

  // Bulk operations - 5 requests per 5 minutes
  bulk: new RateLimiter({
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 5
  }),

  // Analytics requests - 50 requests per minute
  analytics: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 50
  }),

  // Onboarding/setup - 10 requests per 10 minutes
  onboarding: new RateLimiter({
    windowMs: 10 * 60 * 1000, // 10 minutes
    maxRequests: 10
  })
};

/**
 * Get the appropriate rate limiter for an endpoint
 * @param endpoint - API endpoint path
 * @returns RateLimiter instance
 */
export function getRateLimiterForEndpoint(endpoint: string): RateLimiter {
  if (endpoint.includes('/auth/') || endpoint.includes('/login') || endpoint.includes('/register')) {
    return rateLimiters.auth;
  }
  
  if (endpoint.includes('/telegram/') || endpoint.includes('/whatsapp/') || endpoint.includes('/send')) {
    return rateLimiters.messaging;
  }
  
  if (endpoint.includes('/ai/') || endpoint.includes('/generate') || endpoint.includes('/content')) {
    return rateLimiters.aiGeneration;
  }
  
  if (endpoint.includes('/bulk') || endpoint.includes('/import') || endpoint.includes('/export')) {
    return rateLimiters.bulk;
  }
  
  if (endpoint.includes('/analytics') || endpoint.includes('/reports')) {
    return rateLimiters.analytics;
  }
  
  if (endpoint.includes('/onboarding') || endpoint.includes('/setup')) {
    return rateLimiters.onboarding;
  }
  
  // Default to general API rate limiter
  return rateLimiters.api;
}

/**
 * Create rate limit headers for HTTP responses
 * @param result - Rate limit check result
 * @returns Headers object
 */
export function createRateLimitHeaders(result: { remaining: number; resetTime: number; retryAfter?: number }): Record<string, string> {
  const headers: Record<string, string> = {
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString()
  };
  
  if (result.retryAfter) {
    headers['Retry-After'] = result.retryAfter.toString();
  }
  
  return headers;
} 