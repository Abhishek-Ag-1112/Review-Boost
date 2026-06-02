import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createBusiness } from '@/lib/db';
import { verifyFirebaseSession } from '@/lib/firebase-admin';

export async function POST(request: NextRequest) {
  try {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized. No session cookie found.' }, { status: 401 });
    }

    let uid = 'mock-owner';
    try {
      const decodedSession = await verifyFirebaseSession(sessionCookie);
      uid = decodedSession.uid;
    } catch (err) {
      return NextResponse.json({ error: 'Unauthorized. Invalid session.' }, { status: 401 });
    }

    const businessData = await request.json();

    if (!businessData.name || !businessData.slug || !businessData.google_place_id) {
      return NextResponse.json({ error: 'Missing name, slug, or place ID' }, { status: 400 });
    }

    // Auto-construct google_review_url based on Place ID
    const googlePlaceId = businessData.google_place_id;
    const googleReviewUrl = `https://search.google.com/local/writereview?placeid=${googlePlaceId}`;

    const savedBusiness = await createBusiness({
      ...businessData,
      owner_id: uid,
      google_review_url: googleReviewUrl
    });

    if (!savedBusiness) {
      return NextResponse.json({ error: 'Failed to create business in database' }, { status: 500 });
    }

    return NextResponse.json(savedBusiness);
  } catch (error) {
    console.error('API Business create error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
