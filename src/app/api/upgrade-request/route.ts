import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyFirebaseSession } from '@/lib/firebase-admin';
import { createUpgradeRequest, getAllUpgradeRequests, updateUpgradeRequestStatus } from '@/lib/db';

// POST — Merchant submits an upgrade request
export async function POST(request: NextRequest) {
  try {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let uid = 'mock-owner';
    try {
      const decoded = await verifyFirebaseSession(sessionCookie);
      uid = decoded.uid;
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { business_id, business_name, current_plan, requested_plan, contact_email, contact_phone } = body;

    if (!business_id || !business_name || !current_plan || !requested_plan) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['free', 'starter', 'growth'].includes(requested_plan)) {
      return NextResponse.json({ error: 'Invalid requested plan' }, { status: 400 });
    }

    const result = await createUpgradeRequest({
      business_id,
      business_name,
      current_plan,
      requested_plan,
      contact_email: contact_email || null,
      contact_phone: contact_phone || null
    });

    if (!result) {
      return NextResponse.json({ error: 'Failed to create upgrade request' }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Upgrade request error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// GET — Admin fetches all upgrade requests
export async function GET(request: NextRequest) {
  try {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const decoded = await verifyFirebaseSession(sessionCookie);
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@reviewpe.online';
      // Allow mock sessions and admin email
      const isMockAdmin = sessionCookie === 'mock-admin-session-cookie';
      const isAdmin = isMockAdmin || decoded.email === adminEmail;
      if (!isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const requests = await getAllUpgradeRequests();
    return NextResponse.json(requests);
  } catch (error) {
    console.error('Fetch upgrade requests error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH — Admin approves/rejects an upgrade request
export async function PATCH(request: NextRequest) {
  try {
    const sessionCookie = cookies().get('session')?.value;
    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      const decoded = await verifyFirebaseSession(sessionCookie);
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@reviewpe.online';
      const isMockAdmin = sessionCookie === 'mock-admin-session-cookie';
      const isAdmin = isMockAdmin || decoded.email === adminEmail;
      if (!isAdmin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
    } catch {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, status } = body;

    if (!id || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    const updated = await updateUpgradeRequestStatus(id, status);
    if (!updated) {
      return NextResponse.json({ error: 'Failed to update request' }, { status: 500 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Upgrade request patch error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
