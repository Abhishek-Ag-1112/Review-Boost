interface RateLimitRecord {
  count: number;
  resetTime: number;
}

// In-memory rate limiting store
const rateLimitStore = new Map<string, RateLimitRecord>();

/**
 * Checks if a key has exceeded its rate limit.
 * Defaults to 100 requests per 1 hour (3,600,000 milliseconds).
 */
export function checkRateLimit(
  key: string,
  limit = 100,
  windowMs = 3600000
): { success: boolean; remaining: number; reset: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (!record) {
    const resetTime = now + windowMs;
    rateLimitStore.set(key, {
      count: 1,
      resetTime
    });
    return { success: true, remaining: limit - 1, reset: resetTime };
  }

  // If the window has expired, reset the counter
  if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
    return { success: true, remaining: limit - 1, reset: record.resetTime };
  }

  // If limit exceeded, return false
  if (record.count >= limit) {
    return { success: false, remaining: 0, reset: record.resetTime };
  }

  record.count++;
  return {
    success: true,
    remaining: limit - record.count,
    reset: record.resetTime
  };
}
