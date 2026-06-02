import { createBrowserClient } from '@supabase/ssr';
import { createClient as createSupabaseRawClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Check if we are in mock mode (no credentials provided)
export const isMockMode = !supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project');

export const createClient = () => {
  return createBrowserClient(
    supabaseUrl || 'https://mock.supabase.co',
    supabaseAnonKey || 'mock-anon-key'
  );
};

export const createAdminClient = () => {
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return createSupabaseRawClient(
    supabaseUrl || 'https://mock.supabase.co',
    supabaseServiceKey || 'mock-service-key',
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    }
  );
};
