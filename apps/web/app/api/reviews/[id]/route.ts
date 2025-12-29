import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { User } from '@/lib/auth-context';
import { Influencer } from '@influencer-platform/shared';

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

  // Fetch review ID from params
  const { id: reviewId } = await params;
  console.log(`Fetching review with ID: ${reviewId}`);

  try {
    // Fetch review with influencer and reviewer details
    const { data: review, error: reviewError } = await supabase
      .from('reviews')
      .select(`
        id,
        overall_rating,
        professionalism_rating,
        communication_rating,
        content_quality_rating,
        roi_rating,
        reliability_rating,
        pros,
        cons,
        advice,
        would_work_again,
        created_at,
        updated_at,
        influencer:influencers!reviews_influencer_id_fkey (
          id,
          name,
          profile_image_url,
          primary_niche,
          verified
        ),
        reviewer:users!reviews_reviewer_id_fkey (
          id,
          first_name,
          last_name,
          company,
          job_title,
          years_experience,
          public_profile
        )
      `)
      .eq('id', reviewId)
      .single();

    if (reviewError || !review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    console.log('Review fetched successfully:', review);

    const reviewer = review.reviewer as unknown as User;
    if (!reviewer) {
      return NextResponse.json({ error: 'Reviewer information is missing' }, { status: 500 });
    }
    
    const influencer = review.influencer as unknown as Influencer;
    if (!influencer) {
      return NextResponse.json({ error: 'Influencer information is missing' }, { status: 500 });
    }


    // Check if current user is the author
    const isAuthor = reviewer.id === user.id;

    // Format the response
    const response = {
      id: review.id,
      overallRating: review.overall_rating,
      professionalism: review.professionalism_rating,
      communication: review.communication_rating,
      contentQuality: review.content_quality_rating,
      roi: review.roi_rating,
      reliability: review.reliability_rating,
      pros: review.pros,
      cons: review.cons,
      advice: review.advice,
      wouldWorkAgain: review.would_work_again,
      createdAt: review.created_at,
      updatedAt: review.updated_at,
      isAuthor,
      influencer: influencer ? {
        id: influencer.id,
        name: influencer.name,
        profileImageUrl: influencer.profile_image_url,
        niche: influencer.primary_niche,
        verified: influencer.verified,
      } : null,
      reviewer: reviewer && (reviewer.public_profile || isAuthor) ? {
        firstName: reviewer.first_name,
        lastName: reviewer.last_name,
        companyName: reviewer.company,
        jobTitle: reviewer.job_title,
        yearsInPR: reviewer.years_experience,
      } : null,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}



export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createServerSupabaseClient();

  // Check authentication
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const reviewId = params.id;

  try {
    // First, verify that the user owns this review
    const { data: existingReview, error: checkError } = await supabase
      .from('reviews')
      .select('reviewer_id')
      .eq('id', reviewId)
      .single();

    if (checkError || !existingReview) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    if (existingReview.reviewer_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden: You can only edit your own reviews' }, { status: 403 });
    }

    const body = await request.json();
    const {
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
    if (!professionalismRating || !communicationRating || !contentQualityRating || !roiRating || !reliabilityRating) {
      return NextResponse.json({ error: 'All rating fields are required' }, { status: 400 });
    }

    if (!pros || !cons || !advice) {
      return NextResponse.json({ error: 'Pros, cons, and advice are required' }, { status: 400 });
    }

    if (wouldWorkAgain === null || wouldWorkAgain === undefined) {
      return NextResponse.json({ error: 'Would work again field is required' }, { status: 400 });
    }

    // Update the review
    const { data: updatedReview, error: updateError } = await supabase
      .from('reviews')
      .update({
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
        rating: Math.round(overallRating), // Update legacy field
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating review:', updateError);
      return NextResponse.json({ error: 'Failed to update review' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Review updated successfully',
      review: updatedReview,
    });
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
