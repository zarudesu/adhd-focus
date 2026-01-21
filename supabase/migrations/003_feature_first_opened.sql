-- Migration: Add first_opened_at to user_feature table
-- Purpose: Track when user first opened a newly unlocked feature
-- Used for: Tutorial display + shimmer animation on new features

-- Add first_opened_at column if not exists (Drizzle will add it via db:push)
-- This migration backfills existing data

-- Backfill: Mark all existing unlocked features as already opened
-- (existing users shouldn't see shimmer on features they've already been using)
UPDATE user_feature
SET first_opened_at = unlocked_at
WHERE unlocked_at IS NOT NULL
  AND first_opened_at IS NULL;

-- Comment for documentation
COMMENT ON COLUMN user_feature.first_opened_at IS 'When user first opened this feature. NULL = never opened, shows shimmer animation.';
