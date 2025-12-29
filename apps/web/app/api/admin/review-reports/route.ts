import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
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

  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const showAll = searchParams.get('all') === 'true';

    // Build query
    let query = supabase
      .from('review_reports')
      .select(`
        id,
        review_id,
        reporter_id,
        reasons,
        additional_info,
        status,
        reviewed_by,
        reviewed_at,
        created_at,
        updated_at,
        review:reviews!review_reports_review_id_fkey (
          id,
          overall_rating,
          pros,
          cons,
          advice,
          influencer:influencers!reviews_influencer_id_fkey (
            id,
            name
          )
        ),
        reporter:users!review_reports_reporter_id_fkey (
          id,
          first_name,
          last_name,
          email
        ),
        reviewer:users!review_reports_reviewed_by_fkey (
          id,
          first_name,
          last_name
        )
      `);

    // Filter by status if provided, otherwise exclude closed reports unless showAll is true
    if (status) {
      query = query.eq('status', status);
    } else if (!showAll) {
      query = query.neq('status', 'closed');
    }
    // If showAll is true, no filtering is applied

    const { data: reports, error: reportsError } = await query.order('created_at', { ascending: false });

    if (reportsError) {
      console.error('Error fetching review reports:', reportsError);
      return NextResponse.json(
        { error: 'Failed to fetch reports' },
        { status: 500 }
      );
    }

    return NextResponse.json({ reports });
  } catch (error) {
    console.error('Error in review reports endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
