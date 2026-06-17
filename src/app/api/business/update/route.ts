import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyFirebaseSession } from '@/lib/firebase-admin';
import { createAdminClient } from '@/lib/supabase-server';
import { isMockMode } from '@/lib/supabase';
import { updateBusinessSettings } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { businessId, ...settings } = await request.json();

    if (!businessId) {
      return NextResponse.json({ error: 'Missing businessId parameter' }, { status: 400 });
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
      // Auto-update review URL if Place ID changes
      if (settings.google_place_id) {
        settings.google_review_url = `https://search.google.com/local/writereview?placeid=${settings.google_place_id}`;
      }
      const updated = await updateBusinessSettings(businessId, settings);
      if (!updated) {
        return NextResponse.json({ error: 'Failed to update business settings' }, { status: 500 });
      }
      return NextResponse.json(updated);
    }

    const supabase = createAdminClient();

    // 2. Get the business details for this owner and verify businessId matches
    const { data: business, error: busError } = await supabase
      .from('businesses')
      .select('id')
      .eq('owner_id', uid)
      .limit(1)
      .single();

    if (busError || !business || business.id !== businessId) {
      return NextResponse.json({ error: 'Unauthorized. You do not own this business.' }, { status: 403 });
    }

    // Auto-update review URL if Place ID changes
    if (settings.google_place_id) {
      settings.google_review_url = `https://search.google.com/local/writereview?placeid=${settings.google_place_id}`;
    }

    // Sanitization: Prevent modifying plan/trial/owner fields directly via client settings updates
    delete settings.plan;
    delete settings.trial_started_at;
    delete settings.trial_ended;
    delete settings.owner_id;
    delete settings.api_key;
    delete settings.is_active;

    const updated = await updateBusinessSettings(businessId, settings);

    if (!updated) {
      return NextResponse.json({ error: 'Failed to update business settings. Check server logs for Supabase errors.' }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('API Business settings update error:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
