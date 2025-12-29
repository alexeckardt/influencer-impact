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

  // Get influencer ID from params
  const { id: influencerId } = await params;

  try {
    // Check if user has already reviewed this influencer
    const { data: existingReview, error } = await supabase
      .from('reviews')
      .select('id, created_at, overall_rating')
      .eq('influencer_id', influencerId)
      .eq('reviewer_id', user.id)
      .maybeSingle();

    if (error) {
      console.error('Error checking for existing review:', error);
      return NextResponse.json({ error: 'Failed to check review status' }, { status: 500 });
    }

    return NextResponse.json({
      hasReviewed: !!existingReview,
      existingReview: existingReview ? {
        id: existingReview.id,
        createdAt: existingReview.created_at,
        rating: existingReview.overall_rating,
      } : null,
    });
  } catch (error) {
    console.error('Error in review check:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
