-- Schedule daily WhatsApp reminder check at 9 AM IST (3:30 AM UTC)
SELECT cron.schedule(
  'send-delivery-reminders',
  '30 3 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.supabase_url') || '/functions/v1/send-delivery-reminders',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.service_role_key'),
      'Content-Type', 'application/json'
    ),
    body := '{}'::jsonb
  );
  $$
);
