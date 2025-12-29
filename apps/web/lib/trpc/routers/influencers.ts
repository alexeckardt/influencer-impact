/**
 * Influencers Router
 * Handles influencer search and retrieval with type safety
 */
import { z } from 'zod';
import { router, protectedProcedure } from '../init';
import {
  InfluencerDetailResponseSchema,
  InfluencerSearchResponseSchema,
} from '@influencer-platform/shared';

export const influencersRouter = router({
  /**
   * Get influencer by ID with full details
   */
  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .output(InfluencerDetailResponseSchema)
    .query(async ({ ctx, input }) => {
      // Fetch influencer with platforms
      const { data: influencer, error: influencerError } = await ctx.supabase
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
        .eq('id', input.id)
        .single();

      if (influencerError || !influencer) {
        throw new Error('Influencer not found');
      }

      // Fetch reviews for this influencer
      const { data: reviews, error: reviewsError } = await ctx.supabase
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
            years_experience,
            public_profile
          )
        `)
        .eq('influencer_id', input.id)
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

      // Calculate engagement rate (placeholder)
      const platforms = influencer.influencer_handles || [];
      const totalFollowers = platforms.reduce((sum: number, p: any) => sum + (p.follower_count || 0), 0);
      const avgFollowers = platforms.length > 0 ? totalFollowers / platforms.length : 0;
      const engagementRate = avgFollowers > 1000000 ? 2.5 : avgFollowers > 100000 ? 3.5 : 4.5;

      // Format the response
      return {
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
          reviewer: r.reviewer && r.reviewer.public_profile ? {
            firstName: r.reviewer.first_name,
            lastName: r.reviewer.last_name,
            companyName: r.reviewer.company,
            jobTitle: r.reviewer.job_title,
            yearsInPR: r.reviewer.years_experience,
          } : null,
        })),
      };
    }),

  /**
   * Search influencers with pagination
   */
  search: protectedProcedure
    .input(z.object({
      page: z.number().min(1).default(1),
      search: z.string().optional(),
      niche: z.string().optional(),
      minRating: z.number().min(0).max(5).optional(),
      verified: z.boolean().optional(),
    }))
    .output(InfluencerSearchResponseSchema)
    .query(async ({ ctx, input }) => {
      const ITEMS_PER_PAGE = 12;
      const offset = (input.page - 1) * ITEMS_PER_PAGE;

      // Build query
      let query = ctx.supabase
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
      if (input.search) {
        query = query.or(`name.ilike.%${input.search}%,bio.ilike.%${input.search}%,primary_niche.ilike.%${input.search}%`);
      }

      // Apply niche filter
      if (input.niche && input.niche !== 'All Niches') {
        query = query.eq('primary_niche', input.niche);
      }

      // Apply verified filter
      if (input.verified !== null && input.verified !== undefined) {
        query = query.eq('verified', input.verified);
      }

      // Apply pagination
      query = query.range(offset, offset + ITEMS_PER_PAGE - 1);

      // Execute query
      const { data: influencers, error, count } = await query;

      if (error) {
        console.error('Error fetching influencers:', error);
        throw new Error('Failed to fetch influencers');
      }

      // Calculate average rating for each influencer
      const influencerIds = influencers?.map(i => i.id) || [];
      
      let ratingsData: any = {};
      if (influencerIds.length > 0) {
        const { data: reviews } = await ctx.supabase
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
      const formattedInfluencers = (influencers || [])
        .map((influencer: any) => {
          const ratingInfo = ratingsData[influencer.id] || { total: 0, count: 0 };
          const avgRating = ratingInfo.count > 0 ? ratingInfo.total / ratingInfo.count : 0;

          // Filter by minimum rating if specified
          if (input.minRating && input.minRating > 0 && avgRating < input.minRating) {
            return null;
          }

          return {
            id: influencer.id,
            name: influencer.name,
            bio: influencer.bio,
            niche: influencer.primary_niche,
            verified: influencer.verified,
            profileImageUrl: influencer.profile_image_url,
            platforms: (influencer.influencer_handles || []).map((p: any) => ({
              platform: p.platform,
              username: p.username,
              url: p.url,
              followerCount: p.follower_count,
            })),
            rating: Number(avgRating.toFixed(1)),
            reviewCount: ratingInfo.count,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null); // Remove null entries with type guard

      const totalPages = Math.ceil((count || 0) / ITEMS_PER_PAGE);

      return {
        influencers: formattedInfluencers,
        pagination: {
          page: input.page,
          perPage: ITEMS_PER_PAGE,
          total: count || 0,
          totalPages,
          hasMore: input.page < totalPages,
        },
      };
    }),

  /**
   * Check if user has reviewed an influencer
   */
  checkUserReview: protectedProcedure
    .input(z.object({ influencerId: z.string().uuid() }))
    .output(z.object({
      hasReviewed: z.boolean(),
      existingReview: z.object({
        id: z.string().uuid(),
        createdAt: z.string(),
        rating: z.number(),
      }).nullable(),
    }))
    .query(async ({ ctx, input }) => {
      const { data: existingReview, error } = await ctx.supabase
        .from('reviews')
        .select('id, created_at, overall_rating')
        .eq('influencer_id', input.influencerId)
        .eq('reviewer_id', ctx.user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking for existing review:', error);
        throw new Error('Failed to check review status');
      }

      return {
        hasReviewed: !!existingReview,
        existingReview: existingReview ? {
          id: existingReview.id,
          createdAt: existingReview.created_at,
          rating: existingReview.overall_rating,
        } : null,
      };
    }),
});
