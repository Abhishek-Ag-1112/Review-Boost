import { NextRequest, NextResponse } from 'next/server';
import { updateBusinessSettings } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { businessId, ...settings } = await request.json();

    if (!businessId) {
      return NextResponse.json({ error: 'Missing businessId parameter' }, { status: 400 });
    }

    // Auto-update review URL if Place ID changes
    if (settings.google_place_id) {
      settings.google_review_url = `https://search.google.com/local/writereview?placeid=${settings.google_place_id}`;
    }

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
