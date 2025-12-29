import { z } from 'zod';

export const UserResponseSchema = z.object({
  id: z.string().uuid(),
});
export type UserResponse = z.infer<typeof UserResponseSchema>;

export const ApproveProspectResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  userId: z.string().uuid(),
});

export const RejectProspectResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});