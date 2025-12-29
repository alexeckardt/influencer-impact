/**
 * Reviews Router
 * Handles review creation and retrieval with type safety
 */
import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from '../init';
import {
  createReviewInputSchema,
  getReviewInputSchema,
  checkUserReviewInputSchema,
} from '@influencer-platform/shared';

export const reviewsRouter = router({
  /**
   * Create a new review
   */
  create: protectedProcedure
    .input(createReviewInputSchema)
    .output(z.object({ 
      success: z.boolean(), 
      reviewId: z.string(),
      message: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Debug: Log context user info
      console.log('Review create - ctx.user:', ctx.user ? { id: ctx.user.id, email: ctx.user.email } : 'undefined');
      console.log('Review create - input.influencerId:', input.influencerId);

      if (!ctx.user || !ctx.user.id) {
        throw new Error('User not authenticated - cannot create review');
      }

      // Verify influencer exists
      const { data: influencer, error: influencerError } = await ctx.supabase
        .from('influencers')
        .select('id')
        .eq('id', input.influencerId)
        .single();

      if (influencerError || !influencer) {
        throw new Error('Influencer not found');
      }

      // Check if user already reviewed this influencer
      const { data: existingReview } = await ctx.supabase
        .from('reviews')
        .select('id')
        .eq('influencer_id', input.influencerId)
        .eq('reviewer_id', ctx.user.id)
        .maybeSingle();

      if (existingReview) {
        throw new Error('You have already reviewed this influencer');
      }

      // Calculate overall rating (average of all ratings)
      const overallRating = (
        input.professionalismRating +
        input.communicationRating +
        input.contentQualityRating +
        input.roiRating +
        input.reliabilityRating
      ) / 5;

      console.log('Review create - About to insert review with reviewer_id:', ctx.user.id);

      // Create the review
      const { data: review, error: reviewError } = await ctx.supabase
        .from('reviews')
        .insert({
          influencer_id: input.influencerId,
          reviewer_id: ctx.user.id,
          overall_rating: overallRating,
          professionalism_rating: input.professionalismRating,
          communication_rating: input.communicationRating,
          content_quality_rating: input.contentQualityRating,
          roi_rating: input.roiRating,
          reliability_rating: input.reliabilityRating,
          pros: input.pros,
          cons: input.cons,
          advice: input.advice,
          would_work_again: input.wouldWorkAgain,
        })
        .select('id')
        .single();

      if (reviewError || !review) {
        console.error('Review creation error:', reviewError);
        throw new Error('Failed to create review');
      }

      console.log('Review created successfully with id:', review.id);

      return {
        success: true,
        reviewId: review.id,
        message: 'Review submitted successfully',
      };
    }),

  /**
   * Get a specific review by ID
   */
  getById: publicProcedure
    .input(getReviewInputSchema)
    .query(async ({ ctx, input }) => {
      const { data: review, error } = await ctx.supabase
        .from('reviews')
        .select(`
          *,
          influencer:influencers!reviews_influencer_id_fkey (
            id,
            name,
            platform,
            handle
          ),
          reviewer:users!reviews_reviewer_id_fkey (
            id,
            first_name,
            last_name,
            company,
            job_title,
            public_profile
          )
        `)
        .eq('id', input.reviewId)
        .single();

      if (error || !review) {
        throw new Error('Review not found');
      }

      return review;
    }),

  /**
   * Check if current user has reviewed a specific influencer
   */
  checkUserReview: protectedProcedure
    .input(checkUserReviewInputSchema)
    .output(z.object({ 
      hasReviewed: z.boolean(),
      reviewId: z.string().nullable(),
    }))
    .query(async ({ ctx, input }) => {
      const { data: review } = await ctx.supabase
        .from('reviews')
        .select('id')
        .eq('influencer_id', input.influencerId)
        .eq('reviewer_id', ctx.user.id)
        .maybeSingle();

      return {
        hasReviewed: !!review,
        reviewId: review?.id || null,
      };
    }),

  /**
   * Update an existing review
   */
  update: protectedProcedure
    .input(z.object({
      reviewId: z.string(),
      overallRating: z.number(),
      professionalismRating: z.number(),
      communicationRating: z.number(),
      contentQualityRating: z.number(),
      roiRating: z.number(),
      reliabilityRating: z.number(),
      pros: z.string(),
      cons: z.string(),
      advice: z.string(),
      wouldWorkAgain: z.boolean(),
    }))
    .output(z.object({ 
      success: z.boolean(), 
      message: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verify review exists and belongs to user
      const { data: existingReview } = await ctx.supabase
        .from('reviews')
        .select('id, reviewer_id')
        .eq('id', input.reviewId)
        .single();

      if (!existingReview) {
        throw new Error('Review not found');
      }

      if (existingReview.reviewer_id !== ctx.user.id) {
        throw new Error('Unauthorized');
      }

      // Update the review
      const { error } = await ctx.supabase
        .from('reviews')
        .update({
          overall_rating: input.overallRating,
          professionalism_rating: input.professionalismRating,
          communication_rating: input.communicationRating,
          content_quality_rating: input.contentQualityRating,
          roi_rating: input.roiRating,
          reliability_rating: input.reliabilityRating,
          pros: input.pros,
          cons: input.cons,
          advice: input.advice,
          would_work_again: input.wouldWorkAgain,
        })
        .eq('id', input.reviewId);

      if (error) {
        console.error('Review update error:', error);
        throw new Error('Failed to update review');
      }

      return {
        success: true,
        message: 'Review updated successfully',
      };
    }),
});
