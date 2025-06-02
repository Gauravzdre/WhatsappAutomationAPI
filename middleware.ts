import { NextRequest, NextResponse } from 'next/server';
import { getRateLimiterForEndpoint, createRateLimitHeaders } from './src/lib/security/rate-limiter';
import { securityAuditLogger } from './src/lib/security/audit-logger';

// Helper function to get client identifier
function getClientIdentifier(request: NextRequest): string {
  // Try to get user ID from auth header or session
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    // Extract user ID from JWT token (simplified)
    try {
      const token = authHeader.replace('Bearer ', '');
      // In a real implementation, you'd decode the JWT properly
      // For now, use the token as identifier
      return `user_${token.substring(0, 10)}`;
    } catch {
      // Fall through to IP-based identification
    }
  }
  
  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';
  return `ip_${ip}`;
}

// Helper function to extract user ID from request
function extractUserId(request: NextRequest): string | undefined {
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    try {
      const token = authHeader.replace('Bearer ', '');
      // In a real implementation, you'd decode the JWT properly
      // For now, return a simplified user ID
      return `user_${token.substring(0, 10)}`;
    } catch {
      return undefined;
    }
  }
  return undefined;
}

// Security headers to add to all responses
const securityHeaders = {
  // Prevent XSS attacks
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  
  // HTTPS enforcement
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  
  // Content Security Policy
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';",
  
  // Referrer policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions policy
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  
  // Remove server information
  'Server': 'WhatsApp-AI-Platform'
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for static files and internal Next.js routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/static/') ||
    pathname.includes('.') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  // Apply security to API routes
  if (pathname.startsWith('/api/')) {
    return handleApiRequest(request);
  }

  // Apply basic security headers to all other routes
  const response = NextResponse.next();
  
  // Add security headers
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

async function handleApiRequest(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const method = request.method;
  const clientId = getClientIdentifier(request);
  const userId = extractUserId(request);
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const startTime = Date.now();

  try {
    // Get appropriate rate limiter for this endpoint
    const rateLimiter = getRateLimiterForEndpoint(pathname);
    
    // Check rate limit
    const rateLimitResult = rateLimiter.checkLimit(clientId);
    
    if (!rateLimitResult.allowed) {
      // Rate limit exceeded
      securityAuditLogger.logRateLimitHit(clientId, pathname, {
        userId,
        method,
        userAgent,
        retryAfter: rateLimitResult.retryAfter
      });

      const response = NextResponse.json(
        {
          success: false,
          error: 'Rate limit exceeded',
          retryAfter: rateLimitResult.retryAfter
        },
        { status: 429 }
      );

      // Add rate limit headers
      const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);
      Object.entries(rateLimitHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      // Add security headers
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });

      return response;
    }

    // Continue with the request
    const response = NextResponse.next();

    // Add rate limit headers to successful responses
    const rateLimitHeaders = createRateLimitHeaders(rateLimitResult);
    Object.entries(rateLimitHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Add security headers
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    // Log API access
    const responseTime = Date.now() - startTime;
    securityAuditLogger.logApiAccess(
      userId,
      pathname,
      method,
      true,
      {
        responseTime,
        userAgent,
        clientId,
        rateLimitRemaining: rateLimitResult.remaining
      }
    );

    return response;

  } catch (error) {
    // Log error
    securityAuditLogger.logApiAccess(
      userId,
      pathname,
      method,
      false,
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        userAgent,
        clientId
      }
    );

    // Return error response with security headers
    const response = NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );

    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });

    return response;
  }
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 