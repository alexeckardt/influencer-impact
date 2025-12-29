import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  timestamp,
  numeric,
  check,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

// ============================================================================
// Prospect Users Table (signup applications)
// ============================================================================
export const prospectUsers = pgTable(
  'prospect_users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    firstName: varchar('first_name', { length: 255 }).notNull(),
    lastName: varchar('last_name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    password: varchar('password', { length: 255 }).notNull(), // This will be hashed
    company: varchar('company', { length: 255 }),
    jobTitle: varchar('job_title', { length: 255 }),
    yearsExperience: varchar('years_experience', { length: 50 }),
    linkedinUrl: varchar('linkedin_url', { length: 500 }),
    status: varchar('status', {
      enum: ['pending', 'approved', 'rejected'],
    }).default('pending').notNull(),
    rejectionReason: text('rejection_reason'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
    reviewedBy: uuid('reviewed_by'), // Admin who approved/rejected
  },
  (table) => ({
    emailIdx: uniqueIndex('prospect_users_email_idx').on(table.email),
  })
);

// ============================================================================
// Users Table (auth-managed, linked to Supabase Auth)
// ============================================================================
export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey(), // This will be set to match Supabase auth.users.id
    prospectUserId: uuid('prospect_user_id').references(() => prospectUsers.id),
    username: varchar('username', { length: 255 }).notNull().unique(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    firstName: varchar('first_name', { length: 255 }).notNull(),
    lastName: varchar('last_name', { length: 255 }).notNull(),
    fullName: varchar('full_name', { length: 255 }),
    avatarUrl: text('avatar_url'),
    bio: text('bio'),
    company: varchar('company', { length: 255 }),
    jobTitle: varchar('job_title', { length: 255 }),
    yearsExperience: varchar('years_experience', { length: 50 }),
    linkedinUrl: varchar('linkedin_url', { length: 500 }),
    role: varchar('role', {
      enum: ['user', 'moderator', 'admin'],
    })
      .default('user')
      .notNull(),
    isVerified: boolean('is_verified').default(false),
    isActive: boolean('is_active').default(true),
    publicProfile: boolean('public_profile').default(true).notNull(),
    hasTempPassword: boolean('has_temp_password').default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    approvedAt: timestamp('approved_at', { withTimezone: true }),
    approvedBy: uuid('approved_by'), // Admin who approved the user
  },
  (table) => ({
    usernameIdx: uniqueIndex('users_username_idx').on(table.username),
    emailIdx: uniqueIndex('users_email_idx').on(table.email),
  })
);

// ============================================================================
// Influencers Table
// ============================================================================
export const influencers = pgTable('influencers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull(),
  bio: text('bio'),
  primaryNiche: varchar('primary_niche', { length: 255 }).notNull(),
  verified: boolean('verified').default(false),
  profileImageUrl: text('profile_image_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ============================================================================
// Influencer Handles (social media accounts)
// ============================================================================
export const influencerHandles = pgTable(
  'influencer_handles',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    influencerId: uuid('influencer_id')
      .notNull()
      .references(() => influencers.id, { onDelete: 'cascade' }),
    platform: varchar('platform', {
      enum: ['twitter', 'instagram', 'tiktok', 'youtube'],
    }).notNull(),
    username: varchar('username', { length: 255 }).notNull(),
    url: text('url').notNull(),
    followerCount: integer('follower_count').default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    influencerPlatformUnique: uniqueIndex('influencer_handles_influencer_platform_unique').on(
      table.influencerId,
      table.platform
    ),
  })
);

// ============================================================================
// Reviews Table
// ============================================================================
export const reviews = pgTable(
  'reviews',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    influencerId: uuid('influencer_id')
      .notNull()
      .references(() => influencers.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    reviewerId: uuid('reviewer_id').references(() => users.id, { onDelete: 'set null' }),
    title: varchar('title', { length: 255 }).notNull(),
    content: text('content').notNull(),
    rating: integer('rating').notNull(),
    overallRating: numeric('overall_rating', { precision: 3, scale: 2 }),
    professionalismRating: integer('professionalism_rating'),
    communicationRating: integer('communication_rating'),
    contentQualityRating: integer('content_quality_rating'),
    roiRating: integer('roi_rating'),
    reliabilityRating: integer('reliability_rating'),
    pros: text('pros'),
    cons: text('cons'),
    advice: text('advice'),
    wouldWorkAgain: boolean('would_work_again'),
    sentiment: varchar('sentiment', { enum: ['positive', 'neutral', 'negative'] }),
    isAnonymous: boolean('is_anonymous').default(false),
    helpfulCount: integer('helpful_count').default(0),
    unhelpfulCount: integer('unhelpful_count').default(0),
    status: varchar('status', {
      enum: ['published', 'draft', 'flagged'],
    })
      .default('draft')
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (table) => ({
    ratingCheck: check('rating_check', sql`${table.rating} >= 1 AND ${table.rating} <= 5`),
  })
);

// ============================================================================
// Review Labels (NLP-derived, for future use)
// ============================================================================
export const reviewLabels = pgTable('review_labels', {
  id: uuid('id').primaryKey().defaultRandom(),
  reviewId: uuid('review_id')
    .notNull()
    .references(() => reviews.id, { onDelete: 'cascade' }),
  labelType: varchar('label_type', {
    enum: ['sentiment', 'topic', 'professionalism', 'authenticity'],
  }).notNull(),
  labelValue: varchar('label_value', { length: 100 }).notNull(),
  confidence: numeric('confidence', { precision: 3, scale: 2 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

// ============================================================================
// Influencer Stats (Denormalized aggregates, updated by background jobs)
// ============================================================================
export const influencerStats = pgTable('influencer_stats', {
  id: uuid('id').primaryKey().defaultRandom(),
  influencerId: uuid('influencer_id')
    .notNull()
    .unique()
    .references(() => influencers.id, { onDelete: 'cascade' }),
  totalReviews: integer('total_reviews').default(0),
  averageRating: numeric('average_rating', { precision: 3, scale: 2 }),
  sentimentPositive: integer('sentiment_positive').default(0),
  sentimentNeutral: integer('sentiment_neutral').default(0),
  sentimentNegative: integer('sentiment_negative').default(0),
  engagementScore: numeric('engagement_score', { precision: 5, scale: 2 }).default('0'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ============================================================================
// Review Reports Table
// ============================================================================
export const reviewReports = pgTable('review_reports', {
  id: uuid('id').primaryKey().defaultRandom(),
  reviewId: uuid('review_id')
    .notNull()
    .references(() => reviews.id, { onDelete: 'cascade' }),
  reporterId: uuid('reporter_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  reasons: text('reasons').array().notNull(),
  additionalInfo: text('additional_info'),
  status: varchar('status', {
    enum: ['open', 'investigating', 'closed'],
  })
    .default('open')
    .notNull(),
  reviewedBy: uuid('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ============================================================================
// User Influencer Views (tracking recently viewed influencers)
// ============================================================================
export const userInfluencerViews = pgTable(
  'user_influencer_views',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    influencerId: uuid('influencer_id')
      .notNull()
      .references(() => influencers.id, { onDelete: 'cascade' }),
    lastSeen: timestamp('last_seen', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    pk: {
      name: 'user_influencer_views_pkey',
      columns: [table.userId, table.influencerId],
    },
  })
);
