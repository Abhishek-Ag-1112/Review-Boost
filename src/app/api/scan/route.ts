import { NextRequest, NextResponse } from 'next/server';
import { logScan } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { businessId, scanSource } = await request.json();
    const userAgent = request.headers.get('user-agent') || undefined;
    const referrer = request.headers.get('referer') || undefined;

    if (!businessId || !scanSource) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    await logScan(businessId, scanSource, userAgent, referrer);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Scan logging error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
