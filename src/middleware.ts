import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { createServerClient } from '@supabase/ssr';
import { locales } from './i18n';

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale: 'en',
  localeDetection: true
});

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Run next-intl for all pages
  const response = intlMiddleware(request);

  // Strip locale from path to do route checks
  const pathWithoutLocale = pathname.replace(/^\/(en|hi|mr|ta|te|kn)(\/|$)/, '/');

  const isDashboardRoute = pathWithoutLocale.startsWith('/dashboard');
  const isOnboardingRoute = pathWithoutLocale.startsWith('/onboarding');
  const isLoginRoute = pathWithoutLocale === '/login' || pathWithoutLocale === '/login/';
  const isNfcRoute = pathWithoutLocale.startsWith('/nfc');

  const isAdminRoute = pathWithoutLocale.startsWith('/admin') && !pathWithoutLocale.startsWith('/admin/login');
  const isAdminLoginRoute = pathWithoutLocale === '/admin/login' || pathWithoutLocale === '/admin/login/';

  // For admin routes, verify admin session
  if (isAdminRoute || isAdminLoginRoute) {
    const sessionCookie = request.cookies.get('session')?.value;
    const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project');
    
    let isUserAdmin = false;

    if (isMock) {
      isUserAdmin = sessionCookie === 'mock-admin-session-cookie';
    } else if (sessionCookie) {
      try {
        const { decodeJwt } = require('jose');
        const payload = decodeJwt(sessionCookie);
        const isExpired = payload.exp ? Date.now() >= payload.exp * 1000 : true;
        
        const adminEmail = process.env.ADMIN_EMAIL || 'admin@reviewboost.com';
        isUserAdmin = !isExpired && payload.email === adminEmail;
      } catch (err) {
        console.error('Failed to decode Admin JWT:', err);
        isUserAdmin = false;
      }
    }

    const localeMatch = pathname.match(/^\/(en|hi|mr|ta|te|kn)\b/);
    const locale = localeMatch ? localeMatch[1] : 'en';

    if (!isUserAdmin && isAdminRoute) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/admin/login`;
      return NextResponse.redirect(url);
    }

    if (isUserAdmin && isAdminLoginRoute) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/admin`;
      return NextResponse.redirect(url);
    }
    
    return response;
  }

  // For dashboard, onboarding, and login, verify session
  if (isDashboardRoute || isOnboardingRoute || isLoginRoute) {
    const sessionCookie = request.cookies.get('session')?.value;
    
    // Check if we are running in mock mode
    const isMock = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project');
    
    let isUserAuthenticated = false;

    if (isMock) {
      // In mock mode, verify mock session cookie is present
      isUserAuthenticated = sessionCookie === 'mock-session-cookie';
    } else if (sessionCookie) {
      try {
        const { decodeJwt } = require('jose');
        const payload = decodeJwt(sessionCookie);
        const isExpired = payload.exp ? Date.now() >= payload.exp * 1000 : true;
        isUserAuthenticated = !isExpired;
      } catch (err) {
        console.error('Failed to decode Edge JWT:', err);
        isUserAuthenticated = false;
      }
    }

    // Find current locale to build redirect URL
    const localeMatch = pathname.match(/^\/(en|hi|mr|ta|te|kn)\b/);
    const locale = localeMatch ? localeMatch[1] : 'en';

    if (!isUserAuthenticated && (isDashboardRoute || isOnboardingRoute)) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/login`;
      return NextResponse.redirect(url);
    }

    if (isUserAuthenticated && isLoginRoute) {
      const url = request.nextUrl.clone();
      url.pathname = `/${locale}/dashboard`;
      return NextResponse.redirect(url);
    }
    
    return response;
  }

  return response;
}

export const config = {
  // Match all pathnames except API routes and static assets
  matcher: [
    '/',
    '/(en|hi|mr|ta|te|kn)/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*$).*)'
  ]
};
