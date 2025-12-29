import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createServerSupabaseClient();

  // Check authentication and admin role
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify user is an admin
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userError || !userData || userData.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id: reportId } = await params;

  try {
    const body = await request.json();
    const { status } = body;

    // Validate status
    if (!status || !['open', 'investigating', 'closed'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: open, investigating, closed' },
        { status: 400 }
      );
    }

    // Update the report
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    // If status is being changed from open, set reviewed_by and reviewed_at
    if (status !== 'open') {
      updateData.reviewed_by = user.id;
      updateData.reviewed_at = new Date().toISOString();
    }

    const { data: report, error: updateError } = await supabase
      .from('review_reports')
      .update(updateData)
      .eq('id', reportId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating review report:', updateError);
      return NextResponse.json(
        { error: 'Failed to update report' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error('Error in update report endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
