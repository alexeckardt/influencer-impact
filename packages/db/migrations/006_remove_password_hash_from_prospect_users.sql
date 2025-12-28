-- Migration: Remove password_hash column from prospect_users table

ALTER TABLE prospect_users
DROP COLUMN password;