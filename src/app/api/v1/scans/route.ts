import { NextRequest, NextResponse } from 'next/server';
import { validatePublicApiRequest } from '@/lib/apiAuth';
import { getScans } from '@/lib/db';

export async function GET(req: NextRequest) {
  // 1. Validate credentials & rate limit
  const auth = await validatePublicApiRequest(req);
  if (!auth.authorized) {
    return auth.response;
  }

  const business = auth.business!;
  const rateLimitHeaders = auth.rateLimitHeaders;

  try {
    // 2. Parse query parameters
    const { searchParams } = new URL(req.url);
    const startDateParam = searchParams.get('start_date');
    const endDateParam = searchParams.get('end_date');
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    let limit = limitParam ? parseInt(limitParam, 10) : 50;
    let offset = offsetParam ? parseInt(offsetParam, 10) : 0;

    // Sanitize pagination inputs
    if (isNaN(limit) || limit <= 0) limit = 50;
    if (limit > 100) limit = 100; // max limit
    if (isNaN(offset) || offset < 0) offset = 0;

    // 3. Fetch scans from DB
    let scans = await getScans(business.id);

    // 4. Filter by date ranges
    if (startDateParam) {
      const startDate = new Date(startDateParam);
      if (!isNaN(startDate.getTime())) {
        scans = scans.filter(s => new Date(s.scanned_at) >= startDate);
      }
    }
    if (endDateParam) {
      const endDate = new Date(endDateParam);
      if (!isNaN(endDate.getTime())) {
        scans = scans.filter(s => new Date(s.scanned_at) <= endDate);
      }
    }

    const totalCount = scans.length;

    // 5. Slice for pagination
    const paginatedScans = scans.slice(offset, offset + limit);

    // 6. Return response
    return NextResponse.json(
      {
        business_id: business.id,
        business_name: business.name,
        total: totalCount,
        limit,
        offset,
        scans: paginatedScans.map(s => ({
          id: s.id || null,
          scanned_at: s.scanned_at,
          scan_source: s.scan_source,
          user_agent: s.user_agent || null,
          referrer: s.referrer || null
        }))
      },
      {
        status: 200,
        headers: rateLimitHeaders
      }
    );
  } catch (err: any) {
    console.error('API /v1/scans error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500, headers: rateLimitHeaders }
    );
  }
}
export const dynamic = 'force-dynamic';
