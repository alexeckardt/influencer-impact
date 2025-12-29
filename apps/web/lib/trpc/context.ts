/**
 * tRPC context - available in all procedures
 * Contains authenticated user info and Supabase client
 */
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { User } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';

interface UserData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'user' | 'admin';
  company: string | null;
  job_title: string | null;
}

export interface Context {
  supabase: SupabaseClient;
  user: User | null;
  userData: UserData | null;
}

/**
 * Creates context for each tRPC request
 * Handles authentication and fetches user data if authenticated
 */
export async function createContext(): Promise<Context> {
  const supabase = await createServerSupabaseClient();
  
  // Get authenticated user
  const { data: { user }, error } = await supabase.auth.getUser();
  
  let userData: UserData | null = null;
  
  // If user is authenticated, fetch their full data
  if (user && !error) {
    const { data } = await supabase
      .from('users')
      .select('id, first_name, last_name, email, role, company, job_title')
      .eq('id', user.id)
      .single();
    
    userData = data as UserData | null;
  }
  
  return {
    supabase,
    user: user || null,
    userData,
  };
}
