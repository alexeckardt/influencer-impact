import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const ITEMS_PER_PAGE = 12;

export async function GET(req: NextRequest) {
  try {
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

    // Verify user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const search = searchParams.get('search') || '';
    const niche = searchParams.get('niche') || '';
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const verified = searchParams.get('verified');

    // Validate pagination
    if (page < 1) {
      return NextResponse.json({ error: 'Invalid page number' }, { status: 400 });
    }

    // Calculate offset
    const offset = (page - 1) * ITEMS_PER_PAGE;

    // Build query with proper filtering (Supabase handles parameterization)
    let query = supabase
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
      `, { count: 'exact' });

    // Apply search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,bio.ilike.%${search}%,primary_niche.ilike.%${search}%`);
    }

    // Apply niche filter
    if (niche && niche !== 'All Niches') {
      query = query.eq('primary_niche', niche);
    }

    // Apply verified filter
    if (verified !== null && verified !== undefined && verified !== '') {
      query = query.eq('verified', verified === 'true');
    }

    // Apply pagination
    query = query.range(offset, offset + ITEMS_PER_PAGE - 1);

    // Execute query
    const { data: influencers, error, count } = await query;

    if (error) {
      console.error('Error fetching influencers:', error);
      return NextResponse.json({ error: 'Failed to fetch influencers' }, { status: 500 });
    }

    // Calculate average rating for each influencer
    const influencerIds = influencers?.map(i => i.id) || [];
    
    let ratingsData: any = {};
    if (influencerIds.length > 0) {
      const { data: reviews } = await supabase
        .from('reviews')
        .select('influencer_id, overall_rating')
        .in('influencer_id', influencerIds);

      // Group by influencer and calculate average
      ratingsData = (reviews || []).reduce((acc: any, review: any) => {
        if (!acc[review.influencer_id]) {
          acc[review.influencer_id] = { total: 0, count: 0 };
        }
        acc[review.influencer_id].total += review.overall_rating;
        acc[review.influencer_id].count += 1;
        return acc;
      }, {});
    }

    // Format response
    const formattedInfluencers = (influencers || []).map((influencer: any) => {
      const ratingInfo = ratingsData[influencer.id] || { total: 0, count: 0 };
      const avgRating = ratingInfo.count > 0 ? ratingInfo.total / ratingInfo.count : 0;

      // Filter by minimum rating if specified
      if (minRating > 0 && avgRating < minRating) {
        return null;
      }

      return {
        id: influencer.id,
        name: influencer.name,
        bio: influencer.bio,
        niche: influencer.primary_niche,
        verified: influencer.verified,
        profileImageUrl: influencer.profile_image_url,
        platforms: influencer.influencer_handles || [],
        rating: Number(avgRating.toFixed(1)),
        reviewCount: ratingInfo.count,
      };
    }).filter(Boolean); // Remove null entries from rating filter

    const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);

    return NextResponse.json({
      influencers: formattedInfluencers,
      pagination: {
        page,
        perPage: ITEMS_PER_PAGE,
        total: count || 0,
        totalPages,
        hasMore: page < totalPages,
      },
    });
  } catch (error) {
    console.error('Error in influencers search API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
