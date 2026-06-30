-- STEP 1 of 2 — Run this first, then run 004_step2_functions.sql
-- PostgreSQL requires new enum values to be committed before they can be used.

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'sales_manager';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'sales_executive';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'leading_staff';
