/**
 * Main tRPC App Router
 * Combines all sub-routers into a single type-safe API
 */
import { router } from '../init';
import { reviewReportsRouter } from './review-reports';
import { reviewsRouter } from './reviews';
import { influencersRouter } from './influencers';
import { adminRouter } from './admin';

/**
 * This is the primary router for your server.
 * All routers added in /routers should be manually added here.
 */
export const appRouter = router({
  reviewReports: reviewReportsRouter,
  reviews: reviewsRouter,
  influencers: influencersRouter,
  admin: adminRouter,
});

// Export type definition of API
export type AppRouter = typeof appRouter;
