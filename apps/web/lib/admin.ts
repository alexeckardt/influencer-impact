import { createClient } from '@supabase/supabase-js';

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
  // Check for required environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is missing');
  }

  if (!process.env.SUPABASE_SB_SECRET) {
    throw new Error('SUPABASE_SB_SECRET environment variable is missing');
  }

  // Use createClient for admin operations with secret key - no cookies needed
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SB_SECRET!, // Admin secret key for elevated operations
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
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
  console.log('approveProspectUser: Starting approval process for prospect:', prospectId);

  const supabase = await createServerSupabaseAdmin();

  // Get prospect user details first to validate and get email
  console.log('approveProspectUser: Fetching prospect data');
  const { data: prospectData, error: prospectError } = await supabase
    .from('prospect_users')
    .select('*')
    .eq('id', prospectId)
    .single();

  if (prospectError) {
    console.error('approveProspectUser: Error fetching prospect:', prospectError);
    throw new Error(`Failed to fetch prospect: ${prospectError.message}`);
  }

  if (!prospectData) {
    console.error('approveProspectUser: Prospect not found');
    throw new Error('Prospect user not found');
  }

  const prospect = prospectData as ProspectUser;
  console.log('approveProspectUser: Found prospect:', prospect.email);

  if (prospect.status !== 'pending') {
    console.error('approveProspectUser: Prospect status is not pending:', prospect.status);
    throw new Error('Prospect user has already been reviewed');
  }

  // STEP 1: Create Supabase auth user FIRST
  console.log('approveProspectUser: Creating Supabase auth user first');
  const tempPassword = prospect.email + '_temp_' + Math.random().toString(36).substring(7);

  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: prospect.email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: {
      first_name: prospect.first_name,
      last_name: prospect.last_name,
    }
  });

  if (authError) {
    console.error('approveProspectUser: Auth user creation failed:', authError);
    throw new Error(`Failed to create auth user: ${authError.message}`);
  }

  if (!authUser.user) {
    console.error('approveProspectUser: No user returned from auth creation');
    throw new Error('Failed to create auth user: No user returned');
  }

  console.log('approveProspectUser: Auth user created with ID:', authUser.user.id);

  // STEP 2: Now insert into users table using the auth user ID
  console.log('approveProspectUser: Creating user profile');
  const username = `${prospect.first_name.toLowerCase()}.${prospect.last_name.toLowerCase()}`;

  const { error: userError } = await supabase
    .from('users')
    .insert({
      id: authUser.user.id, // Use the auth user ID
      prospect_user_id: prospect.id,
      username: username,
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
    console.error('approveProspectUser: User profile creation failed:', userError);
    // If user creation fails, clean up auth user
    console.log('approveProspectUser: Cleaning up auth user due to profile creation failure');
    await supabase.auth.admin.deleteUser(authUser.user.id);
    throw new Error(`Failed to create user profile: ${userError.message}`);
  }

  console.log('approveProspectUser: User profile created successfully');

  // STEP 3: Update prospect status
  console.log('approveProspectUser: Updating prospect status');
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
    console.error('approveProspectUser: Failed to update prospect status:', updateError);
  } else {
    console.log('approveProspectUser: Prospect status updated successfully');
  }

  console.log('approveProspectUser: Approval process completed successfully');
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
      username: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${Math.floor(Math.random() * 1000)}`,
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