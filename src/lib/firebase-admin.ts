import { createClient as createSupabaseRawClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Mock mode if Supabase credentials are not set or are default
export const isFirebaseAdminMock =
  !supabaseUrl ||
  !supabaseAnonKey ||
  supabaseUrl.includes('your-project');

export const adminAuth = null as any;

// Helper to verify the secure session cookie (using Supabase Auth getUser)
export async function verifyFirebaseSession(sessionCookie: string) {
  if (isFirebaseAdminMock) {
    if (
      sessionCookie === 'mock-jwt-token' ||
      sessionCookie === 'mock-session-cookie' ||
      sessionCookie === 'mock-admin-session-cookie'
    ) {
      const email = sessionCookie === 'mock-admin-session-cookie'
        ? (process.env.ADMIN_EMAIL || 'admin@reviewboost.com')
        : 'merchant@reviewboost.com';
      return { uid: 'mock-owner', email };
    }
    throw new Error('Invalid mock session cookie');
  }

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase client not initialized. Check credentials in .env.local');
  }

  // We initialize the raw Supabase client to verify the JWT session token
  const supabase = createSupabaseRawClient(supabaseUrl, supabaseAnonKey);
  const { data, error } = await supabase.auth.getUser(sessionCookie);

  if (error || !data || !data.user) {
    console.error('verifyFirebaseSession error: failed to get user from Supabase.', 'Error:', error, 'Cookie snippet:', sessionCookie ? sessionCookie.substring(0, 15) + '...' : 'none');
    throw new Error(error?.message || 'Invalid or expired session token');
  }

  const user = data.user;
  return { uid: user.id, email: user.email! };
}
