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

  const { id: influencerId } = await params;

  try {

    console.log(`Fetching influencer with ID: ${influencerId}`);

    // Fetch influencer with platforms
    const { data: influencer, error: influencerError } = await supabase
      .from('influencers')
      .select(`
        id,
        name,
        bio,
        primary_niche,
        verified,
        profile_image_url,
        influencer_handles (
          platform,
          username,
          url,
          follower_count
        )
      `)
      .eq('id', influencerId)
      .single();

    if (influencerError || !influencer) {
      console.log('Influencer fetch error:', influencerError);
      console.log(`Influencer with ID ${influencerId} not found.`);
      return NextResponse.json({ error: 'Influencer not found' }, { status: 404 });
    }

    // Fetch reviews for this influencer
    const { data: reviews, error: reviewsError } = await supabase
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
        reviewer:users!reviews_reviewer_id_fkey (
          id,
          first_name,
          last_name,
          company,
          job_title,
          years_experience
        )
      `)
      .eq('influencer_id', influencerId)
      .order('created_at', { ascending: false });

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError);
    }

    // Calculate average ratings
    const reviewsList = reviews || [];
    const totalReviews = reviewsList.length;

    let avgRatings = {
      overall: 0,
      professionalism: 0,
      communication: 0,
      contentQuality: 0,
      roi: 0,
      reliability: 0,
    };

    if (totalReviews > 0) {
      avgRatings = {
        overall: reviewsList.reduce((sum, r) => sum + (r.overall_rating || 0), 0) / totalReviews,
        professionalism: reviewsList.reduce((sum, r) => sum + (r.professionalism_rating || 0), 0) / totalReviews,
        communication: reviewsList.reduce((sum, r) => sum + (r.communication_rating || 0), 0) / totalReviews,
        contentQuality: reviewsList.reduce((sum, r) => sum + (r.content_quality_rating || 0), 0) / totalReviews,
        roi: reviewsList.reduce((sum, r) => sum + (r.roi_rating || 0), 0) / totalReviews,
        reliability: reviewsList.reduce((sum, r) => sum + (r.reliability_rating || 0), 0) / totalReviews,
      };
    }

    // Calculate engagement rate (placeholder - would need actual data)
    // For now, we'll use a formula based on follower count average
    const platforms = influencer.influencer_handles || [];
    const totalFollowers = platforms.reduce((sum: number, p: any) => sum + (p.follower_count || 0), 0);
    const avgFollowers = platforms.length > 0 ? totalFollowers / platforms.length : 0;
    // Simple heuristic: larger accounts tend to have lower engagement rates
    const engagementRate = avgFollowers > 1000000 ? 2.5 : avgFollowers > 100000 ? 3.5 : 4.5;

    // Format the response
    const response = {
      id: influencer.id,
      name: influencer.name,
      bio: influencer.bio,
      niche: influencer.primary_niche,
      profileImageUrl: influencer.profile_image_url,
      verified: influencer.verified,
      platforms: platforms.map((p: any) => ({
        platform: p.platform,
        username: p.username,
        url: p.url,
        followerCount: p.follower_count,
      })),
      ratings: avgRatings,
      totalReviews,
      engagementRate,
      reviews: reviewsList.map((r: any) => ({
        id: r.id,
        overallRating: r.overall_rating,
        professionalism: r.professionalism_rating,
        communication: r.communication_rating,
        contentQuality: r.content_quality_rating,
        roi: r.roi_rating,
        reliability: r.reliability_rating,
        pros: r.pros,
        cons: r.cons,
        advice: r.advice,
        wouldWorkAgain: r.would_work_again,
        createdAt: r.created_at,
        reviewer: r.reviewer ? {
          firstName: r.reviewer.first_name,
          lastName: r.reviewer.last_name,
          companyName: r.reviewer.company,
          jobTitle: r.reviewer.job_title,
          yearsInPR: r.reviewer.years_experience,
        } : null,
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching influencer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
