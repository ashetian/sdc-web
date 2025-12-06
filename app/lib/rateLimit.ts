/**
 * Simple in-memory rate limiter for API endpoints
 * Note: This resets on server restart. For production, consider Redis-based solution.
 */

interface RateLimitEntry {
    count: number;
    firstRequest: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of rateLimitStore.entries()) {
            if (now - entry.firstRequest > 60000) {
                rateLimitStore.delete(key);
            }
        }
    }, 5 * 60 * 1000);
}

interface RateLimitConfig {
    maxRequests: number;     // Max requests allowed
    windowMs: number;        // Time window in milliseconds
}

export const RATE_LIMITS = {
    LOGIN: { maxRequests: 5, windowMs: 60 * 1000 },           // 5 attempts per minute
    API_GENERAL: { maxRequests: 100, windowMs: 60 * 1000 },   // 100 requests per minute
    SENSITIVE: { maxRequests: 10, windowMs: 60 * 1000 },      // 10 requests per minute (delete, create, etc.)
};

/**
 * Check if a request should be rate limited
 * @param identifier - Unique identifier (IP address or user ID)
 * @param action - The action being rate limited (e.g., 'login', 'api')
 * @param config - Rate limit configuration
 * @returns Object with limited status and remaining attempts
 */
export function checkRateLimit(
    identifier: string,
    action: string,
    config: RateLimitConfig
): { limited: boolean; remaining: number; resetIn: number } {
    const key = `${action}:${identifier}`;
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    // No previous requests
    if (!entry) {
        rateLimitStore.set(key, { count: 1, firstRequest: now });
        return { limited: false, remaining: config.maxRequests - 1, resetIn: config.windowMs };
    }

    // Window has expired, reset
    if (now - entry.firstRequest > config.windowMs) {
        rateLimitStore.set(key, { count: 1, firstRequest: now });
        return { limited: false, remaining: config.maxRequests - 1, resetIn: config.windowMs };
    }

    // Within window
    if (entry.count >= config.maxRequests) {
        const resetIn = config.windowMs - (now - entry.firstRequest);
        return { limited: true, remaining: 0, resetIn };
    }

    // Increment counter
    entry.count++;
    return {
        limited: false,
        remaining: config.maxRequests - entry.count,
        resetIn: config.windowMs - (now - entry.firstRequest)
    };
}

/**
 * Get client IP from request headers
 */
export function getClientIP(request: Request): string {
    const forwarded = request.headers.get('x-forwarded-for');
    const realIP = request.headers.get('x-real-ip');

    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }
    if (realIP) {
        return realIP;
    }
    return 'unknown';
}
