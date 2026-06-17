import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyFirebaseSession } from '@/lib/firebase-admin';
import { createAdminClient } from '@/lib/supabase-server';
import { isMockMode } from '@/lib/supabase';
import { resolvePrivateFeedback } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { reviewId, isResolved, ownerNote } = await request.json();

    if (!reviewId) {
      return NextResponse.json({ error: 'Missing reviewId parameter' }, { status: 400 });
    }

    // 1. Auth verification
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

    if (isMockMode) {
      const updated = await resolvePrivateFeedback(reviewId, isResolved, ownerNote);
      if (!updated) {
        return NextResponse.json({ error: 'Failed to update review status' }, { status: 500 });
      }
      return NextResponse.json(updated);
    }

    const supabase = createAdminClient();

    // 2. Get the business details for this owner
    const { data: business, error: busError } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', uid)
      .limit(1)
      .single();

    if (busError || !business) {
      return NextResponse.json({ error: 'Business not found for this user.' }, { status: 404 });
    }

    // 3. Verify the review belongs to the user's business
    const { data: review, error: revError } = await supabase
      .from('reviews')
      .select('business_id')
      .eq('id', reviewId)
      .single();

    if (revError || !review || review.business_id !== business.id) {
      return NextResponse.json({ error: 'Unauthorized. Review does not belong to your business.' }, { status: 403 });
    }

    // 4. Resolve the private feedback
    const updated = await resolvePrivateFeedback(reviewId, isResolved, ownerNote);

    if (!updated) {
      return NextResponse.json({ error: 'Failed to update review status' }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('API Feedback resolution error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
