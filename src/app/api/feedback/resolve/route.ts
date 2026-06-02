import { NextRequest, NextResponse } from 'next/server';
import { resolvePrivateFeedback } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { reviewId, isResolved, ownerNote } = await request.json();

    if (!reviewId) {
      return NextResponse.json({ error: 'Missing reviewId parameter' }, { status: 400 });
    }

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
