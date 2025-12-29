import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createServerSupabaseClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: reviewId } = await params;

  try {
    // Check if user has already reported this review
    const { data: existingReport, error } = await supabase
      .from('review_reports')
      .select('id')
      .eq('review_id', reviewId)
      .eq('reporter_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error checking report status:', error);
      return NextResponse.json(
        { error: 'Failed to check report status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      hasReported: !!existingReport,
    });
  } catch (error) {
    console.error('Error in report check endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createServerSupabaseClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id: reviewId } = await params;

  try {
    // Parse request body
    const body = await request.json();
    const { reasons, additionalInfo } = body;

    // Validate input
    if (!reasons || !Array.isArray(reasons) || reasons.length === 0) {
      return NextResponse.json(
        { error: 'At least one reason must be selected' },
        { status: 400 }
      );
    }

    // Verify the review exists
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select('id')
      .eq('id', reviewId)
      .single();

    if (reviewError || !review) {
      return NextResponse.json(
        { error: 'Review not found' },
        { status: 404 }
      );
    }

    // Check if user has already reported this review
    const { data: existingReport } = await supabase
      .from('review_reports')
      .select('id')
      .eq('review_id', reviewId)
      .eq('reporter_id', user.id)
      .single();

    if (existingReport) {
      return NextResponse.json(
        { error: 'You have already reported this review' },
        { status: 409 }
      );
    }

    // Create the report
    const { data: report, error: insertError } = await supabase
      .from('review_reports')
      .insert({
        review_id: reviewId,
        reporter_id: user.id,
        reasons,
        additional_info: additionalInfo || null,
        status: 'open',
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating review report:', insertError);
      return NextResponse.json(
        { error: 'Failed to submit report' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      report,
    });
  } catch (error) {
    console.error('Error in report endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
