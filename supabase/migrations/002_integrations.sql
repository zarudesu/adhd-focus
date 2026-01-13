-- Migration: Add integration fields for Telegram and Google Calendar
-- Run after 001_initial_schema.sql

-- Add Telegram integration fields to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS telegram_id BIGINT UNIQUE,
ADD COLUMN IF NOT EXISTS telegram_username TEXT;

-- Add Google Calendar integration fields to profiles
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS google_calendar_token JSONB,
ADD COLUMN IF NOT EXISTS google_calendar_id TEXT DEFAULT 'primary';

-- Add Google event ID to tasks for calendar sync
ALTER TABLE tasks
ADD COLUMN IF NOT EXISTS google_event_id TEXT;

-- Index for Telegram lookup
CREATE INDEX IF NOT EXISTS idx_profiles_telegram_id ON profiles(telegram_id);

-- Index for Google Calendar event lookup
CREATE INDEX IF NOT EXISTS idx_tasks_google_event_id ON tasks(google_event_id);

-- API Keys table for external integrations
CREATE TABLE IF NOT EXISTS api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key_hash TEXT NOT NULL, -- bcrypt hash of the actual key
  key_prefix TEXT NOT NULL, -- First 8 chars for identification (e.g., "adhd_abc")
  scopes TEXT[] NOT NULL DEFAULT ARRAY['tasks:read', 'tasks:write'],
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,

  CONSTRAINT valid_scopes CHECK (
    scopes <@ ARRAY['tasks:read', 'tasks:write', 'profile:read', 'profile:write', 'sessions:read', 'sessions:write']::TEXT[]
  )
);

-- RLS for API keys
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own API keys"
  ON api_keys FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own API keys"
  ON api_keys FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can revoke own API keys"
  ON api_keys FOR UPDATE
  USING (auth.uid() = user_id);

-- Index for API key lookup
CREATE INDEX IF NOT EXISTS idx_api_keys_prefix ON api_keys(key_prefix) WHERE revoked_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);

-- Webhooks table for outgoing notifications
CREATE TABLE IF NOT EXISTS webhooks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT ARRAY['task.created'],
  secret TEXT, -- For signature verification
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMPTZ,
  failure_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT valid_events CHECK (
    events <@ ARRAY['task.created', 'task.updated', 'task.completed', 'task.deleted', 'session.started', 'session.completed']::TEXT[]
  )
);

-- RLS for webhooks
ALTER TABLE webhooks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own webhooks"
  ON webhooks FOR ALL
  USING (auth.uid() = user_id);

-- Index for webhook lookup
CREATE INDEX IF NOT EXISTS idx_webhooks_user_events ON webhooks(user_id, events) WHERE is_active = true;

-- Function to notify webhooks on task changes
CREATE OR REPLACE FUNCTION notify_webhooks()
RETURNS TRIGGER AS $$
DECLARE
  webhook_record RECORD;
  event_type TEXT;
  payload JSONB;
BEGIN
  -- Determine event type
  IF TG_OP = 'INSERT' THEN
    event_type := 'task.created';
    payload := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'done' AND OLD.status != 'done' THEN
      event_type := 'task.completed';
    ELSE
      event_type := 'task.updated';
    END IF;
    payload := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    event_type := 'task.deleted';
    payload := to_jsonb(OLD);
  END IF;

  -- Queue webhook notifications (using pg_notify for Edge Function to process)
  PERFORM pg_notify('webhook_events', jsonb_build_object(
    'user_id', COALESCE(NEW.user_id, OLD.user_id),
    'event', event_type,
    'payload', payload
  )::TEXT);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for task webhooks
DROP TRIGGER IF EXISTS task_webhook_trigger ON tasks;
CREATE TRIGGER task_webhook_trigger
  AFTER INSERT OR UPDATE OR DELETE ON tasks
  FOR EACH ROW EXECUTE FUNCTION notify_webhooks();

COMMENT ON TABLE api_keys IS 'API keys for external integrations (Telegram bots, scripts, etc.)';
COMMENT ON TABLE webhooks IS 'Outgoing webhooks for real-time notifications to external services';
