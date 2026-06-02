import { NextRequest, NextResponse } from 'next/server';
import { validatePublicApiRequest } from '@/lib/apiAuth';
import { getDashboardSummary, getScanSourceBreakdown } from '@/lib/db';

export async function GET(req: NextRequest) {
  // 1. Authenticate API Bearer token & check rate limits
  const auth = await validatePublicApiRequest(req);
  if (!auth.authorized) {
    return auth.response;
  }

  const business = auth.business!;
  const rateLimitHeaders = auth.rateLimitHeaders;

  try {
    // 2. Fetch metrics
    const [summary, sources] = await Promise.all([
      getDashboardSummary(business.id),
      getScanSourceBreakdown(business.id)
    ]);

    // 3. Format sources array to structured key-value mapping
    const sourceMapping: Record<string, number> = {
      qr: 0,
      nfc: 0,
      link: 0,
      whatsapp: 0
    };
    
    sources.forEach((s: { source: string; count: number }) => {
      if (sourceMapping[s.source] !== undefined) {
        sourceMapping[s.source] = s.count;
      }
    });

    // 4. Return formatted stats
    return NextResponse.json(
      {
        business_id: business.id,
        business_name: business.name,
        slug: business.slug,
        plan: business.plan,
        metrics: {
          average_rating: summary.averageStars,
          total_reviews: summary.totalReviews,
          total_scans: summary.totalScans,
          google_redirect_rate_percentage: summary.redirectRate,
          unresolved_private_feedbacks: summary.unresolvedFeedbackCount
        },
        scan_sources: sourceMapping
      },
      {
        status: 200,
        headers: rateLimitHeaders
      }
    );
  } catch (err: any) {
    console.error('API /v1/summary error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500, headers: rateLimitHeaders }
    );
  }
}
export const dynamic = 'force-dynamic';
