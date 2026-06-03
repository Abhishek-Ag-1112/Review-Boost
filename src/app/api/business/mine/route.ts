import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyFirebaseSession } from '@/lib/firebase-admin';
import { getFirstBusinessForOwner } from '@/lib/db';

export async function GET(req: NextRequest) {
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
      console.error('API /business/mine: Auth verification failed. Error:', err);
      return NextResponse.json({ error: 'Unauthorized. Invalid session.' }, { status: 401 });
    }

    const data = await getFirstBusinessForOwner(uid);

    if (!data) {
      // No business found for this user - they need to onboard
      return NextResponse.json(null, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('API /business/mine error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
