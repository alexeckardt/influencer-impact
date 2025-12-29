import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('public_profile')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile settings:', error);
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }

    return NextResponse.json({ publicProfile: data.public_profile });
  } catch (error) {
    console.error('Error in profile settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { publicProfile } = body;

    if (typeof publicProfile !== 'boolean') {
      return NextResponse.json({ error: 'Invalid publicProfile value' }, { status: 400 });
    }

    const { error } = await supabase
      .from('users')
      .update({ public_profile: publicProfile })
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile settings:', error);
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Profile settings updated successfully',
      publicProfile 
    });
  } catch (error) {
    console.error('Error updating profile settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
