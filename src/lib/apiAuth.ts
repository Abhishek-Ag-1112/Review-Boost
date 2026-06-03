import { NextRequest, NextResponse } from 'next/server';
import { getBusinessByApiKey, Business } from './db';
import { checkRateLimit } from './rateLimit';

export interface AuthResult {
  authorized: boolean;
  response?: NextResponse;
  business?: Business;
  rateLimitHeaders?: Record<string, string>;
}

export async function validatePublicApiRequest(req: NextRequest): Promise<AuthResult> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Missing or malformed Authorization header. Use Bearer token.' },
        { status: 401 }
      )
    };
  }

  const apiKey = authHeader.substring(7).trim();
  const business = await getBusinessByApiKey(apiKey);

  if (!business) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Invalid API key.' },
        { status: 401 }
      )
    };
  }

  // Gate check: Only Growth plan businesses can access public APIs
  if (business.plan !== 'growth') {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'API access is available on the Growth plan. Please upgrade your plan.' },
        { status: 403 }
      )
    };
  }

  // Rate limiting check: 100 requests per hour
  const rateLimitResult = checkRateLimit(apiKey, 100, 3600000);
  
  const rateLimitHeaders = {
    'X-RateLimit-Limit': '100',
    'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(rateLimitResult.reset / 1000).toString(),
  };

  if (!rateLimitResult.success) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: 'Too Many Requests. Rate limit of 100 requests per hour exceeded.' },
        { status: 429, headers: rateLimitHeaders }
      ),
      rateLimitHeaders
    };
  }

  return {
    authorized: true,
    business,
    rateLimitHeaders
  };
}
