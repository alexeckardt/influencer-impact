// Lib for Supabase client configuration

import { createBrowserClient } from '@supabase/auth-helpers-nextjs';

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
