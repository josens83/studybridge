import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Database type - using 'any' since we don't have generated types from Supabase
/* eslint-disable-next-line */
type Database = any;

// Lazy initialization for client-side Supabase client
let _supabase: SupabaseClient<Database> | null = null;

export const getSupabase = (): SupabaseClient<Database> => {
  if (!_supabase) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
      );
    }

    _supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
  }

  return _supabase;
};

// For backward compatibility - this will be a getter that returns the lazy-initialized client
export const supabase = new Proxy({} as SupabaseClient<Database>, {
  get(_, prop) {
    /* eslint-disable-next-line */
    return (getSupabase() as any)[prop];
  },
});

// Server-side admin client (lazy initialization to avoid client-side errors)
let _supabaseAdmin: SupabaseClient<Database> | null = null;

export const getSupabaseAdmin = (): SupabaseClient<Database> => {
  if (typeof window !== 'undefined') {
    throw new Error('supabaseAdmin should only be used on the server side');
  }

  if (!_supabaseAdmin) {
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
    }

    _supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );
  }

  return _supabaseAdmin;
};
