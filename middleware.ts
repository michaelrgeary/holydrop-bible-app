import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Rate limiting storage (in production, use Redis or similar)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

export async function middleware(request: NextRequest) {
  // First, handle Supabase session
  const response = await updateSession(request);
  
  // Get client IP
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'anonymous';
  
  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute
    const maxRequests = 100; // 100 requests per minute per IP
    
    const key = `${ip}:${Math.floor(now / windowMs)}`;
    const current = rateLimit.get(key) || { count: 0, resetTime: now + windowMs };
    
    current.count++;
    rateLimit.set(key, current);
    
    if (current.count > maxRequests) {
      return new Response('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': '60',
          'X-RateLimit-Limit': maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': current.resetTime.toString(),
        },
      });
    }
    
    // Add rate limit headers to response
    response.headers.set('X-RateLimit-Limit', maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', (maxRequests - current.count).toString());
    response.headers.set('X-RateLimit-Reset', current.resetTime.toString());
  }

  // Enhanced Security Headers
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'unsafe-eval' 'unsafe-inline' https://va.vercel-scripts.com https://*.supabase.co;
    style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
    img-src 'self' blob: data: https:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https://*.supabase.co https://api.vercel.com;
    object-src 'none';
    base-uri 'self';
    form-action 'self';
    frame-ancestors 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ').trim();

  // Set security headers
  response.headers.set('Content-Security-Policy', cspHeader);
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');

  // Remove server information
  response.headers.delete('Server');
  response.headers.delete('X-Powered-By');

  // Block known malicious paths
  const maliciousPaths = [
    '/.env',
    '/wp-admin',
    '/admin',
    '/.git',
    '/phpmyadmin',
    '/.htaccess',
    '/config.php',
    '/wp-config.php',
    '/xmlrpc.php',
  ];

  if (maliciousPaths.some(path => request.nextUrl.pathname.startsWith(path))) {
    return new Response('Not Found', { status: 404 });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};