import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import twilio from 'twilio';
import { isMockMode } from '@/lib/supabase';

// Initialize Resend with key if available
const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');

// Initialize Twilio if credentials are available
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

export async function POST(request: NextRequest) {
  try {
    const { businessId, reviewId } = await request.json();

    if (!businessId || !reviewId) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    let business: any = null;
    let review: any = null;

    if (isMockMode) {
      // Create mock details for log output
      business = {
        name: 'Chai Point Jaipur',
        whatsapp_number: '+919876543210',
        notification_email: 'jaipur@chaipoint.com',
        plan: 'growth'
      };
      review = {
        stars: 2,
        private_feedback: 'The tea was cold and the table service took 20 minutes.',
        customer_name: 'Rahul Sharma',
        customer_phone: '+919812345678',
        created_at: new Date().toISOString()
      };
    } else {
      // Fetch details from Supabase using Service Role client (bypassing user RLS since this is a server function)
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { data: bData, error: bErr } = await supabaseAdmin
        .from('businesses')
        .select('*')
        .eq('id', businessId)
        .single();

      const { data: rData, error: rErr } = await supabaseAdmin
        .from('reviews')
        .select('*')
        .eq('id', reviewId)
        .single();

      if (bErr || rErr) {
        console.error('Error querying Supabase for notifications:', { bErr, rErr });
        return NextResponse.json({ error: 'Failed to retrieve notification context' }, { status: 500 });
      }

      business = bData;
      review = rData;
    }

    // Guard: Only notify for negative feedback threshold (default: 3 stars or below)
    if (review.stars > 3) {
      return NextResponse.json({ success: true, message: 'Rating is positive, skipping alert.' });
    }

    // --- 1. WhatsApp Notification via Twilio ---
    const whatsappMessage = `🔴 New private feedback — ${business.name}
⭐ Rating: ${review.stars}/5
💬 ${review.private_feedback || 'No comments'}
👤 ${review.customer_name || 'Anonymous'}
📞 ${review.customer_phone || 'Not provided'}
🔗 View & resolve: ${process.env.NEXT_PUBLIC_APP_URL || 'https://reviewpe.online'}/dashboard/reviews`;

    if (twilioClient && business.whatsapp_number) {
      try {
        // Send WhatsApp using Twilio
        await twilioClient.messages.create({
          from: process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886',
          to: `whatsapp:${business.whatsapp_number.startsWith('+') ? business.whatsapp_number : '+' + business.whatsapp_number}`,
          body: whatsappMessage
        });
        console.log(`[Twilio] WhatsApp alert sent successfully to ${business.whatsapp_number}`);
      } catch (err) {
        console.error('[Twilio] Failed to send WhatsApp:', err);
      }
    } else {
      console.log('--- [MOCK NOTIFY] Twilio WhatsApp Notification Output ---');
      console.log('To:', business.whatsapp_number || 'No number specified');
      console.log('Message:\n', whatsappMessage);
      console.log('-------------------------------------------------------');
    }

    // --- 2. Email Notification via Resend ---
    const emailSubject = `⭐${review.stars}/5 — New private feedback for ${business.name}`;
    const emailHtml = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #f1f5f9; border-radius: 16px;">
        <h2 style="color: #ef4444; margin-top: 0;">🔴 New Private Feedback</h2>
        <p style="font-size: 16px; font-weight: bold; color: #1e293b; margin-bottom: 24px;">
          ${business.name} received a ${review.stars}-star rating.
        </p>
        
        <div style="background-color: #f8fafc; padding: 18px; border-radius: 12px; margin-bottom: 24px; border-left: 4px solid #ef4444;">
          <p style="margin: 0; font-size: 15px; color: #475569; font-style: italic; line-height: 1.6;">
            "${review.private_feedback}"
          </p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 28px; font-size: 14px;">
          <tr>
            <td style="padding: 8px 0; border-b: 1px solid #f1f5f9; color: #64748b; font-weight: 500;">Customer Name</td>
            <td style="padding: 8px 0; border-b: 1px solid #f1f5f9; color: #1e293b; font-weight: 600; text-align: right;">
              ${review.customer_name || 'Anonymous'}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-b: 1px solid #f1f5f9; color: #64748b; font-weight: 500;">Customer Phone</td>
            <td style="padding: 8px 0; border-b: 1px solid #f1f5f9; color: #1e293b; font-weight: 600; text-align: right;">
              ${review.customer_phone ? `<a href="tel:${review.customer_phone}">${review.customer_phone}</a>` : 'Not provided'}
            </td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-b: 1px solid #f1f5f9; color: #64748b; font-weight: 500;">Scanned At</td>
            <td style="padding: 8px 0; border-b: 1px solid #f1f5f9; color: #1e293b; font-weight: 600; text-align: right;">
              ${new Date(review.created_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} (IST)
            </td>
          </tr>
        </table>

        <div style="text-align: center;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://reviewpe.online'}/dashboard/reviews" 
             style="display: inline-block; background-color: #ef4444; color: #ffffff; text-decoration: none; padding: 12px 24px; font-size: 15px; font-weight: bold; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
            Mark as Resolved
          </a>
        </div>
      </div>
    `;

    if (process.env.RESEND_API_KEY && business.notification_email) {
      try {
        await resend.emails.send({
          from: process.env.NOTIFICATION_FROM_EMAIL || 'alerts@reviewpe.online',
          to: business.notification_email,
          subject: emailSubject,
          html: emailHtml
        });
        console.log(`[Resend] Email alert sent successfully to ${business.notification_email}`);
      } catch (err) {
        console.error('[Resend] Failed to send email alert:', err);
      }
    } else {
      console.log('--- [MOCK NOTIFY] Resend Email Notification Output ---');
      console.log('Subject:', emailSubject);
      console.log('To:', business.notification_email || 'No email specified');
      console.log('Body:\n', emailHtml);
      console.log('----------------------------------------------------');
    }

    // --- 3. Supabase Realtime ---
    // If not in mock mode, broadcast message to the dashboard reviews channel
    if (!isMockMode) {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );
      
      await supabaseAdmin.channel('dashboard_updates').send({
        type: 'broadcast',
        event: 'new_private_feedback',
        payload: { reviewId, stars: review.stars, businessId }
      });
      console.log('[Realtime] Broadcasted new review event.');
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Notify Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
