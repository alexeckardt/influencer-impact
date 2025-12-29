/**
 * tRPC initialization file
 * Exports the core tRPC instance used across the application
 */
import { initTRPC, TRPCError } from '@trpc/server';
import superjson from 'superjson';
import { Context } from './context';

// Initialize tRPC with superjson transformer for handling Date, Map, Set, etc.
const t = initTRPC.context<Context>().create({
  transformer: superjson,
  errorFormatter({ shape }) {
    return shape;
  },
});

/**
 * Export reusable router and procedure helpers
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure - requires authentication
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'You must be logged in' });
  }
  
  return next({
    ctx: {
      ...ctx,
      user: ctx.user, // Now guaranteed to be non-null
    },
  });
});

/**
 * Admin procedure - requires admin role
 */
export const adminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (!ctx.userData || ctx.userData.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  
  return next({
    ctx: {
      ...ctx,
      userData: ctx.userData, // Guaranteed to have admin role
    },
  });
});
