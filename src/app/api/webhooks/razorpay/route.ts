import { NextResponse } from 'next/server';
import { updateBusinessSettings, getBusinessBySlug } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { event, payload: eventPayload } = payload;

    if (!event) {
      return NextResponse.json({ error: 'Missing event field' }, { status: 400 });
    }

    console.log(`[Razorpay Webhook] Received event: ${event}`);

    // Inside a production Razorpay flow, metadata or notes will contain the merchant business ID.
    // e.g., eventPayload.payment.entity.notes.business_id or notes.slug
    const notes = eventPayload?.payment?.entity?.notes || eventPayload?.subscription?.entity?.notes || {};
    const businessSlug = notes.business_slug || 'tress-lounge-pune-8f2a'; // Default fallback for simulator testing

    const business = await getBusinessBySlug(businessSlug);
    if (!business) {
      console.warn(`[Razorpay Webhook] Business not found for slug: ${businessSlug}`);
      return NextResponse.json({ error: 'Business not found' }, { status: 404 });
    }

    switch (event) {
      case 'payment.captured': {
        const amount = (eventPayload.payment.entity.amount || 39900) / 100; // in Rupees
        // Support custom plan in checkout notes, fallback to standard plans based on price
        const chosenPlan = notes.plan || (amount >= 799 ? 'growth' : 'starter');

        console.log(`[Razorpay Webhook] Activating plan '${chosenPlan}' for: ${business.name} (Amount: ₹${amount})`);
        
        await updateBusinessSettings(business.id, {
          plan: chosenPlan,
          trial_ended: false,
          is_active: true,
          payment_status: 'paid',
          payment_amount: amount,
          payment_due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        });
        break;
      }

      case 'subscription.halted': {
        console.log(`[Razorpay Webhook] Subscription suspended/halted for: ${business.name}`);
        
        await updateBusinessSettings(business.id, {
          trial_ended: true, // Puts dashboard in read-only lock state
          is_active: false,  // Pauses customer facing page
          payment_status: 'unpaid'
        });
        break;
      }

      case 'payment.failed': {
        console.warn(`[Razorpay Webhook] Payment failed for merchant: ${business.name}`);
        
        // Emulate sending warning triggers/emails
        await updateBusinessSettings(business.id, {
          payment_status: 'unpaid'
        });
        break;
      }

      default:
        console.log(`[Razorpay Webhook] Event '${event}' was ignored.`);
        break;
    }

    return NextResponse.json({ success: true, received: event });
  } catch (err: any) {
    console.error('[Razorpay Webhook] Handler error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
