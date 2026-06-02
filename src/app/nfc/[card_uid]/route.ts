import { resolveNfcRedirect } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: { card_uid: string } }
) {
  const { card_uid } = params;

  const userAgent = req.headers.get('user-agent') || undefined;
  const referrer = req.headers.get('referer') || undefined;

  // Resolve card mapping, increment count, and log scan
  const redirectUrl = await resolveNfcRedirect(card_uid, userAgent, referrer);

  if (redirectUrl) {
    // Construct absolute URL for redirection
    const url = new URL(redirectUrl, req.url);
    return NextResponse.redirect(url, 307);
  }

  // Fallback if not found: redirect to login page with error code
  const fallbackUrl = new URL('/en/login?error=nfc_not_found', req.url);
  return NextResponse.redirect(fallbackUrl, 307);
}

export const dynamic = 'force-dynamic';
