import { NextRequest, NextResponse } from 'next/server';
import { validatePublicApiRequest } from '@/lib/apiAuth';
import { getReviewsInbox, Review } from '@/lib/db';

export async function GET(req: NextRequest) {
  // 1. Authorize & rate-limit request
  const auth = await validatePublicApiRequest(req);
  if (!auth.authorized) {
    return auth.response;
  }

  const business = auth.business!;
  const rateLimitHeaders = auth.rateLimitHeaders;

  try {
    // 2. Parse query parameters
    const { searchParams } = new URL(req.url);
    const starsParam = searchParams.get('stars');
    const isPublicParam = searchParams.get('is_public');
    const startDateParam = searchParams.get('start_date');
    const endDateParam = searchParams.get('end_date');

    const stars = starsParam ? parseInt(starsParam, 10) : undefined;
    const isPublic = isPublicParam === 'true' ? true : isPublicParam === 'false' ? false : undefined;

    // 3. Query reviews
    let reviews = await getReviewsInbox(business.id, {
      stars,
      isPublic,
      sort: 'newest'
    });

    // 4. Apply date-range filters
    if (startDateParam) {
      const startDate = new Date(startDateParam);
      if (!isNaN(startDate.getTime())) {
        reviews = reviews.filter((r: Review) => new Date(r.created_at) >= startDate);
      }
    }
    if (endDateParam) {
      const endDate = new Date(endDateParam);
      if (!isNaN(endDate.getTime())) {
        reviews = reviews.filter((r: Review) => new Date(r.created_at) <= endDate);
      }
    }

    // 5. Respond with data & headers
    return NextResponse.json(
      {
        business_id: business.id,
        business_name: business.name,
        count: reviews.length,
        reviews: reviews.map((r: Review) => ({
          id: r.id,
          stars: r.stars,
          is_public: r.is_public,
          private_feedback: r.private_feedback || null,
          customer_name: r.customer_name || null,
          customer_phone: r.customer_phone || null,
          custom_text: r.custom_text || null,
          is_resolved: r.is_resolved,
          created_at: r.created_at
        }))
      },
      {
        status: 200,
        headers: rateLimitHeaders
      }
    );
  } catch (err: any) {
    console.error('API /v1/reviews error:', err);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500, headers: rateLimitHeaders }
    );
  }
}
export const dynamic = 'force-dynamic';
