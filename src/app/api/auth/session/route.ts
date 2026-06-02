import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { isFirebaseAdminMock, adminAuth } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: 'Missing ID token' }, { status: 400 });
    }

    let sessionCookie = '';
    const expiresIn = 14 * 24 * 60 * 60 * 1000; // 14 days

    if (isFirebaseAdminMock) {
      sessionCookie = 'mock-session-cookie';
    } else {
      if (!adminAuth) {
        return NextResponse.json({ error: 'Firebase Admin not initialized' }, { status: 500 });
      }
      sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    }

    cookies().set('session', sessionCookie, {
      maxAge: expiresIn / 1000,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return NextResponse.json({ status: 'success' });
  } catch (error: any) {
    console.error('Session API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
