-- Migration: Add hasTempPassword column to users table

ALTER TABLE users
ADD COLUMN has_temp_password BOOLEAN DEFAULT true;