import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';
import { verifyFirebaseSession } from '@/lib/firebase-admin';
import { createAdminClient } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  try {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized. No session cookie found.' }, { status: 401 });
    }

    let uid = '';
    try {
      const decodedSession = await verifyFirebaseSession(sessionCookie);
      uid = decodedSession.uid;
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized. Invalid session.' }, { status: 401 });
    }

    const supabase = createAdminClient();

    // 1. Get the business details
    const { data: business, error: busError } = await supabase
      .from('businesses')
      .select('*')
      .eq('owner_id', uid)
      .limit(1)
      .single();

    if (busError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const businessId = business.id;
    const { searchParams } = new URL(req.url);
    const locationId = searchParams.get('locationId') || undefined;

    // 2. Fetch all required analytics concurrently
    let scansQuery = supabase.from('qr_scans').select('scan_source').eq('business_id', businessId);
    let reviewsQuery = supabase.from('reviews').select('id, stars, is_public, is_resolved, custom_text, private_feedback, customer_name, created_at, location_id').eq('business_id', businessId).order('created_at', { ascending: false });
    let dailyScansQuery = supabase.from('qr_scans').select('scanned_at').eq('business_id', businessId).gte('scanned_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

    if (locationId) {
      if (locationId === 'main') {
        scansQuery = scansQuery.is('location_id', null);
        reviewsQuery = reviewsQuery.is('location_id', null);
        dailyScansQuery = dailyScansQuery.is('location_id', null);
      } else {
        scansQuery = scansQuery.eq('location_id', locationId);
        reviewsQuery = reviewsQuery.eq('location_id', locationId);
        dailyScansQuery = dailyScansQuery.eq('location_id', locationId);
      }
    }

    const [scansRes, reviewsRes, dailyScansRes] = await Promise.all([
      scansQuery,
      reviewsQuery,
      dailyScansQuery
    ]);

    const scansData = scansRes.data || [];
    const reviewsData = reviewsRes.data || [];
    const dailyScansRaw = dailyScansRes.data || [];

    const totalScans = scansData.length;
    const totalReviews = reviewsData.length;
    let starsSum = 0;
    let publicCount = 0;
    let unresolvedFeedbackCount = 0;

    const starDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    reviewsData.forEach(r => {
      starsSum += r.stars;
      if (r.is_public) publicCount++;
      if (!r.is_public && !r.is_resolved) unresolvedFeedbackCount++;
      starDistribution[r.stars] = (starDistribution[r.stars] || 0) + 1;
    });

    const averageStars = totalReviews > 0 ? parseFloat((starsSum / totalReviews).toFixed(1)) : 0.0;
    const redirectRate = totalReviews > 0 ? Math.round((publicCount / totalReviews) * 100) : 0;

    const starBreakdown = Object.keys(starDistribution).map(star => ({
      stars: parseInt(star, 10),
      count: starDistribution[parseInt(star, 10)]
    }));

    // Calculate scan source breakdown
    const sourceBreakdownMap: Record<string, number> = { qr: 0, nfc: 0, link: 0, whatsapp: 0 };
    scansData.forEach(s => {
      const src = s.scan_source || 'qr';
      if (sourceBreakdownMap[src] !== undefined) {
        sourceBreakdownMap[src]++;
      }
    });
    const sourceBreakdown = Object.keys(sourceBreakdownMap).map(source => ({
      source,
      count: sourceBreakdownMap[source]
    }));

    // Calculate daily scans heat (last 14 days)
    const datesMap: Record<string, number> = {};
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      datesMap[dateStr] = 0;
    }
    dailyScansRaw.forEach(s => {
      const dateStr = s.scanned_at.split('T')[0];
      if (datesMap[dateStr] !== undefined) {
        datesMap[dateStr]++;
      }
    });
    const dailyScans = Object.keys(datesMap).map(date => ({
      date,
      scans: datesMap[date]
    }));

    return NextResponse.json({
      summary: {
        totalScans,
        totalReviews,
        averageStars,
        redirectRate,
        unresolvedFeedbackCount
      },
      recentReviews: reviewsData.slice(0, 10),
      dailyScans,
      starBreakdown,
      sourceBreakdown
    });
  } catch (error) {
    console.error('API /dashboard/data error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
