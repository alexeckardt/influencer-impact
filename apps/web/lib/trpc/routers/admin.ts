/**
 * Admin Router
 * Handles admin-only functionality with type safety
 */
import { z } from 'zod';
import { router, adminProcedure } from '../init';
import { ApproveProspectResponseSchema, RejectProspectResponseSchema } from '@influencer-platform/shared';
import { createServerSupabaseAdmin, approveProspectUser, rejectProspectUser } from '@/lib/admin';

export const adminRouter = router({
  /**
   * Approve a prospect user
   */
  approveProspect: adminProcedure
    .input(z.object({ prospectId: z.string().uuid() }))
    .output(ApproveProspectResponseSchema)
    .mutation(async ({ ctx, input }) => {
      const supabase = await createServerSupabaseAdmin();
      
      // Approve the prospect user
      const approvedUser = await approveProspectUser(input.prospectId, ctx.user.id);

      // Send approval email
      if (approvedUser.user.email && approvedUser.tempPassword) {
        const { sendApprovalEmail } = await import('@/lib/emails');
        await sendApprovalEmail(
          approvedUser.user.email,
          approvedUser.user.user_metadata?.first_name || 'User',
          approvedUser.tempPassword
        );
      }

      return {
        success: true,
        message: 'Prospect approved successfully',
        userId: approvedUser.user.id,
      };
    }),

  /**
   * Reject a prospect user
   */
  rejectProspect: adminProcedure
    .input(z.object({ 
      prospectId: z.string().uuid(),
      reason: z.string().optional(),
    }))
    .output(RejectProspectResponseSchema)
    .mutation(async ({ ctx, input }) => {
      await rejectProspectUser(input.prospectId, ctx.user.id, input.reason);

      return {
        success: true,
        message: 'Prospect rejected successfully',
      };
    }),
});
