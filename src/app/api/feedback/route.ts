import { NextRequest, NextResponse } from 'next/server';
import { createReview } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const {
      businessId,
      stars,
      isPublic,
      privateFeedback,
      customerName,
      customerPhone,
      aiSuggestionUsed,
      customText,
      languageUsed,
      locationId
    } = await request.json();

    if (!businessId || !stars) {
      return NextResponse.json({ error: 'Missing businessId or stars rating' }, { status: 400 });
    }

    const savedReview = await createReview({
      business_id: businessId,
      stars,
      is_public: isPublic,
      private_feedback: privateFeedback,
      customer_name: customerName,
      customer_phone: customerPhone,
      ai_suggestion_used: aiSuggestionUsed,
      custom_text: customText,
      language_used: languageUsed,
      location_id: locationId
    });

    if (!savedReview) {
      return NextResponse.json({ error: 'Failed to save review in database' }, { status: 500 });
    }

    return NextResponse.json(savedReview);
  } catch (error) {
    console.error('API Feedback saving error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
