-- Homefy CRM — create / reset test admin
-- Run in Supabase SQL Editor AFTER 001_initial_schema.sql
-- Login: admin@123.local / aa

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$
DECLARE
  user_id uuid;
  user_email text := 'admin@123.local';
  instance uuid;
BEGIN
  SELECT id INTO instance FROM auth.instances LIMIT 1;
  IF instance IS NULL THEN
    instance := '00000000-0000-0000-0000-000000000000';
  END IF;

  SELECT id INTO user_id FROM auth.users WHERE email = user_email;

  IF user_id IS NOT NULL THEN
    -- Reset password if user already exists
    UPDATE auth.users
    SET
      encrypted_password = crypt('aa', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, NOW()),
      raw_user_meta_data = '{"full_name":"Admin","role":"admin"}'::jsonb,
      updated_at = NOW()
    WHERE id = user_id;

    INSERT INTO public.profiles (id, email, full_name, role)
    VALUES (user_id, user_email, 'Admin', 'admin')
    ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = 'Admin';

    RAISE NOTICE 'Reset password for existing user: % / aa', user_email;
    RETURN;
  END IF;

  user_id := gen_random_uuid();

  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    instance,
    user_id,
    'authenticated',
    'authenticated',
    user_email,
    crypt('aa', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{"full_name":"Admin","role":"admin"}',
    false,
    NOW(),
    NOW(),
    '', '', '', ''
  );

  INSERT INTO auth.identities (
    id,
    user_id,
    provider_id,
    identity_data,
    provider,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    user_id,
    user_email,
    jsonb_build_object('sub', user_id::text, 'email', user_email, 'email_verified', true),
    'email',
    NOW(),
    NOW(),
    NOW()
  );

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (user_id, user_email, 'Admin', 'admin')
  ON CONFLICT (id) DO UPDATE SET role = 'admin', full_name = 'Admin';

  RAISE NOTICE 'Created admin user: % / password: aa', user_email;
END $$;
