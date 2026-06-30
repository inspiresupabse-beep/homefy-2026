-- Add new staff roles — run STEP 1 only here.
-- Then run 004_step2_functions.sql (or the functions section from 003 after step1).

ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'sales_manager';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'sales_executive';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'leading_staff';
