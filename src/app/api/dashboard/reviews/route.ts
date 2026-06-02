import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
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
      .select('id')
      .eq('owner_id', uid)
      .limit(1)
      .single();

    if (busError || !business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    const businessId = business.id;

    // 2. Parse query parameters
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || undefined;
    const starsParam = searchParams.get('stars');
    const isPublicParam = searchParams.get('isPublic');
    const isResolvedParam = searchParams.get('isResolved');
    const sort = searchParams.get('sort') || 'newest';

    const stars = starsParam ? parseInt(starsParam, 10) : undefined;
    const isPublic = isPublicParam === 'true' ? true : isPublicParam === 'false' ? false : undefined;
    const isResolved = isResolvedParam === 'true' ? true : isResolvedParam === 'false' ? false : undefined;

    let query = supabase.from('reviews').select('*').eq('business_id', businessId);

    if (isPublic !== undefined) {
      query = query.eq('is_public', isPublic);
    }
    if (isResolved !== undefined && isPublic === false) {
      query = query.eq('is_resolved', isResolved);
    }
    if (stars !== undefined) {
      query = query.eq('stars', stars);
    }
    if (search) {
      query = query.or(`custom_text.ilike.%${search}%,private_feedback.ilike.%${search}%,customer_name.ilike.%${search}%,customer_phone.ilike.%${search}%`);
    }

    // Sort mappings
    if (sort === 'newest') query = query.order('created_at', { ascending: false });
    else if (sort === 'oldest') query = query.order('created_at', { ascending: true });
    else if (sort === 'stars_desc') query = query.order('stars', { ascending: false });
    else if (sort === 'stars_asc') query = query.order('stars', { ascending: true });

    const { data: reviews, error: revError } = await query;

    if (revError) {
      console.error('Error querying reviews in API:', revError);
      return NextResponse.json([]);
    }

    return NextResponse.json(reviews || []);
  } catch (error) {
    console.error('API /dashboard/reviews error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
