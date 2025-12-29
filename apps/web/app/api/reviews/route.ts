import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const {
      influencerId,
      overallRating,
      professionalismRating,
      communicationRating,
      contentQualityRating,
      roiRating,
      reliabilityRating,
      pros,
      cons,
      advice,
      wouldWorkAgain,
    } = body;

    // Validate required fields
    if (!influencerId) {
      return NextResponse.json({ error: 'Influencer ID is required' }, { status: 400 });
    }

    if (!professionalismRating || !communicationRating || !contentQualityRating || !roiRating || !reliabilityRating) {
      return NextResponse.json({ error: 'All rating fields are required' }, { status: 400 });
    }

    if (!pros || !cons || !advice) {
      return NextResponse.json({ error: 'Pros, cons, and advice are required' }, { status: 400 });
    }

    if (wouldWorkAgain === null || wouldWorkAgain === undefined) {
      return NextResponse.json({ error: 'Would work again field is required' }, { status: 400 });
    }

    // Verify influencer exists
    const { data: influencer, error: influencerError } = await supabase
      .from('influencers')
      .select('id')
      .eq('id', influencerId)
      .single();

    if (influencerError || !influencer) {
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 });
    }

    // Check if user already reviewed this influencer
    const { data: existingReview, error: checkError } = await supabase
      .from('reviews')
      .select('id')
      .eq('influencer_id', influencerId)
      .eq('reviewer_id', user.id)
      .maybeSingle();

    if (checkError) {
      console.error('Error checking existing review:', checkError);
      return NextResponse.json({ error: 'Failed to check existing reviews' }, { status: 500 });
    }

    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this influencer' },
        { status: 400 }
      );
    }

    // Get user details for the review
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, first_name, last_name, company, job_title, years_experience')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      console.error('Error fetching user data:', userError);
      return NextResponse.json({ error: 'Failed to fetch user information' }, { status: 500 });
    }

    // Insert the review
    const { data: review, error: insertError } = await supabase
      .from('reviews')
      .insert({
        influencer_id: influencerId,
        reviewer_id: user.id,
        user_id: user.id, // For backward compatibility if needed
        overall_rating: overallRating,
        professionalism_rating: professionalismRating,
        communication_rating: communicationRating,
        content_quality_rating: contentQualityRating,
        roi_rating: roiRating,
        reliability_rating: reliabilityRating,
        pros,
        cons,
        advice,
        would_work_again: wouldWorkAgain,
        rating: Math.round(overallRating), // For backward compatibility with the old rating field
        title: `Review by ${userData.first_name} ${userData.last_name}`, // Default title
        content: pros, // Use pros as content for backward compatibility
        status: 'published', // Auto-publish reviews (can be changed to 'draft' if moderation is needed)
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting review:', insertError);
      return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: 'Review submitted successfully',
        review,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error submitting review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
