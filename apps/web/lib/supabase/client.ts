// Supabase client configuration for browser/client-side operations only

import { createBrowserClient } from '@supabase/ssr';

// Browser client for client-side operations
export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
