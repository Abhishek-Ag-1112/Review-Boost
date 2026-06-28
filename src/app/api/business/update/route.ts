import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyFirebaseSession } from '@/lib/firebase-admin';
import { createAdminClient } from '@/lib/supabase-server';
import { isMockMode } from '@/lib/supabase';
import { updateBusinessSettings } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { businessId, ...settings } = body;

    console.log('[business/update] Received request:', { businessId, settings });

    if (!businessId) {
      return NextResponse.json({ error: 'Missing businessId parameter' }, { status: 400 });
    }

    // 1. Auth verification
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized. No session cookie found.' }, { status: 401 });
    }

    let uid = '';
    let isAdmin = false;
    const isMockAdmin = sessionCookie === 'mock-admin-session-cookie';

    if (isMockAdmin) {
      uid = 'mock-admin';
      isAdmin = true;
    } else {
      try {
        const decodedSession = await verifyFirebaseSession(sessionCookie);
        uid = decodedSession.uid;
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@reviewpe.online';
        isAdmin = decodedSession.email === adminEmail;
        console.log('[business/update] Auth result:', { uid, email: decodedSession.email, adminEmail, isAdmin });
      } catch (err) {
        console.error('[business/update] Session verification failed:', err);
        return NextResponse.json({ error: 'Unauthorized. Invalid session.' }, { status: 401 });
      }
    }

    if (isMockMode) {
      if (settings.google_place_id) {
        settings.google_review_url = `https://search.google.com/local/writereview?placeid=${settings.google_place_id}`;
      }
      const updated = await updateBusinessSettings(businessId, settings);
      if (!updated) {
        return NextResponse.json({ error: 'Failed to update business settings' }, { status: 500 });
      }
      return NextResponse.json(updated);
    }

    if (!isAdmin) {
      // Non-admin: verify ownership
      const supabase = createAdminClient();
      const { data: business, error: busError } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', uid)
        .limit(1)
        .single();

      if (busError || !business || business.id !== businessId) {
        return NextResponse.json({ error: 'Unauthorized. You do not own this business.' }, { status: 403 });
      }

      // Sanitization: Prevent modifying plan/trial/owner fields directly via client settings updates
      delete settings.plan;
      delete settings.trial_started_at;
      delete settings.trial_ended;
      delete settings.owner_id;
      delete settings.api_key;
      delete settings.is_active;
    }

    // Auto-update review URL if Place ID changes
    if (settings.google_place_id) {
      settings.google_review_url = `https://search.google.com/local/writereview?placeid=${settings.google_place_id}`;
    }

    // Clean up payload: remove id and nfc_enabled before sending to Supabase
    const updatePayload = { ...settings };
    delete updatePayload.id;
    delete updatePayload.nfc_enabled;

    console.log('[business/update] Final update payload for business', businessId, ':', updatePayload);

    // Use admin client directly for the DB update (service_role bypasses RLS + trigger)
    const supabaseAdmin = createAdminClient();
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('businesses')
      .update(updatePayload)
      .eq('id', businessId)
      .select()
      .single();

    if (updateError) {
      console.error('[business/update] Supabase update error:', updateError);
      return NextResponse.json({ error: updateError.message || 'Failed to update business settings.' }, { status: 500 });
    }

    console.log('[business/update] Successfully updated business:', updated?.id, 'plan:', updated?.plan);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('[business/update] API error:', error);
    return NextResponse.json({ error: error?.message || 'Internal Server Error' }, { status: 500 });
  }
}
