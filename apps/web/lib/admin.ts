import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Define the prospect user type directly since our Database type might not be complete
type ProspectUser = {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  company: string | null;
  job_title: string | null;
  years_experience: string | null;
  linkedin_url: string | null;
  status: 'pending' | 'approved' | 'rejected';
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
};

/**
 * Server-side utilities for user management and approval
 * These functions should be used in API routes or server actions
 */

export async function createServerSupabaseAdmin() {
  const cookieStore = await cookies();
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!, // Service role key for admin operations
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}

/**
 * Get all pending prospect users (for admin review)
 */
export async function getPendingProspectUsers(): Promise<ProspectUser[]> {
  const supabase = await createServerSupabaseAdmin();
  
  const { data, error } = await supabase
    .from('prospect_users')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data as ProspectUser[];
}

/**
 * Approve a prospect user and create their Supabase auth account
 */
export async function approveProspectUser(prospectId: string, approverId: string) {
  const supabase = await createServerSupabaseAdmin();
  
  // Get prospect user details
  const { data: prospectData, error: prospectError } = await supabase
    .from('prospect_users')
    .select('*')
    .eq('id', prospectId)
    .single();
    
  if (prospectError || !prospectData) {
    throw new Error('Prospect user not found');
  }
  
  const prospect = prospectData as ProspectUser;
  
  if (prospect.status !== 'pending') {
    throw new Error('Prospect user has already been reviewed');
  }
  
  // Create Supabase auth user
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: prospect.email,
    password: prospect.email + '_temp_' + Math.random().toString(36).substring(7), // Generate temp password
    email_confirm: true,
    user_metadata: {
      first_name: prospect.first_name,
      last_name: prospect.last_name,
    }
  });
  
  if (authError || !authUser.user) {
    throw new Error(`Failed to create auth user: ${authError?.message}`);
  }
  
  // Create user in our users table
  const { error: userError } = await supabase
    .from('users')
    .insert({
      id: authUser.user.id,
      prospect_user_id: prospect.id,
      username: `${prospect.first_name.toLowerCase()}.${prospect.last_name.toLowerCase()}`,
      email: prospect.email,
      first_name: prospect.first_name,
      last_name: prospect.last_name,
      full_name: `${prospect.first_name} ${prospect.last_name}`,
      company: prospect.company,
      job_title: prospect.job_title,
      years_experience: prospect.years_experience,
      linkedin_url: prospect.linkedin_url,
      approved_at: new Date().toISOString(),
      approved_by: approverId,
    });
    
  if (userError) {
    // If user creation fails, clean up auth user
    await supabase.auth.admin.deleteUser(authUser.user.id);
    throw new Error(`Failed to create user profile: ${userError.message}`);
  }
  
  // Update prospect status
  const { error: updateError } = await supabase
    .from('prospect_users')
    .update({
      status: 'approved',
      reviewed_at: new Date().toISOString(),
      reviewed_by: approverId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', prospectId);
    
  if (updateError) {
    console.error('Failed to update prospect status:', updateError);
  }
  
  return authUser.user;
}

/**
 * Reject a prospect user application
 */
export async function rejectProspectUser(prospectId: string, approverId: string, reason?: string) {
  const supabase = await createServerSupabaseAdmin();
  
  const { error } = await supabase
    .from('prospect_users')
    .update({
      status: 'rejected',
      rejection_reason: reason || null,
      reviewed_at: new Date().toISOString(),
      reviewed_by: approverId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', prospectId)
    .eq('status', 'pending'); // Only reject pending applications
    
  if (error) {
    throw new Error(`Failed to reject prospect: ${error.message}`);
  }
  
  return true;
}

/**
 * Create the first admin user (run this manually to bootstrap the system)
 */
export async function createInitialAdmin(
  email: string,
  password: string,
  firstName: string,
  lastName: string
) {
  const supabase = await createServerSupabaseAdmin();
  
  // Create Supabase auth user
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name: lastName,
    }
  });
  
  if (authError || !authUser.user) {
    throw new Error(`Failed to create admin auth user: ${authError?.message}`);
  }
  
  // Create admin user profile
  const { error: userError } = await supabase
    .from('users')
    .insert({
      id: authUser.user.id,
      username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}`,
      email,
      first_name: firstName,
      last_name: lastName,
      full_name: `${firstName} ${lastName}`,
      role: 'admin',
      is_verified: true,
      approved_at: new Date().toISOString(),
    });
    
  if (userError) {
    // Clean up auth user on failure
    await supabase.auth.admin.deleteUser(authUser.user.id);
    throw new Error(`Failed to create admin user profile: ${userError.message}`);
  }
  
  return authUser.user;
}

/**
 * Get all users (admin function)
 */
export async function getAllUsers() {
  const supabase = await createServerSupabaseAdmin();
  
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      prospect_users (
        company,
        job_title,
        years_experience,
        linkedin_url
      )
    `)
    .order('created_at', { ascending: false });
    
  if (error) throw error;
  return data;
}