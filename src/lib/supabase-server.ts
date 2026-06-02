import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const createServerSupabaseClient = () => {
  const cookieStore = cookies();
  
  return createServerClient(
    supabaseUrl || 'https://mock.supabase.co',
    supabaseAnonKey || 'mock-anon-key',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }));
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // Ignore cookie modification warnings inside Server Components
          }
        },
      },
    }
  );
};

const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const createAdminClient = () => {
  return createServerClient(
    supabaseUrl || 'https://mock.supabase.co',
    supabaseServiceKey || 'mock-service-key',
    {
      cookies: {
        getAll() {
          return [];
        },
        setAll() {},
      },
    }
  );
};
