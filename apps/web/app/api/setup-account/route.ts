import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function POST(req: NextRequest) {
  try {
    const { password } = await req.json();

    console.log('\n\n\nsetup-account API: Received password update request!!!!');
    
    if (!password) {
      return NextResponse.json({ error: 'Password is required' }, { status: 400 });
    }

    const cookieStore = await cookies();

    // Create server client with cookie access
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          },
        },
      }
    );

    // Get the current authenticated user (validates with server)
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('setup-account API: User authentication failed:', userError);
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    console.log('setup-account API: Updating password for user:', userId);

    // Update the user's password using updateUser (works with authenticated session)
    const { error: updatePasswordError } = await supabase.auth.updateUser({
      password,
    });

    if (updatePasswordError) {
      console.error('Password update error:', updatePasswordError);
      return NextResponse.json({ error: 'Failed to update password' }, { status: 500 });
    }

    // Update the `has_temp_password` flag in the users table
    const { error: updateUserError } = await supabase
      .from('users')
      .update({ has_temp_password: false })
      .eq('id', userId);

    if (updateUserError) {
      return NextResponse.json({ error: 'Failed to update user details' }, { status: 500 });
    }

    // Sign out the user to force them to log in with their new password
    await supabase.auth.signOut();

    return NextResponse.json({ success: true, signedOut: true });
  } catch (error) {
    console.error('Error in setup-account API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}