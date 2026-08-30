-- Concurrency-safe provider event processing and retry metadata.
-- Provider sandbox first; production remains separately gated.

ALTER TABLE banking_provider_events
  ADD COLUMN IF NOT EXISTS processing_token text,
  ADD COLUMN IF NOT EXISTS processing_started_at timestamptz,
  ADD COLUMN IF NOT EXISTS attempt_count integer NOT NULL DEFAULT 0 CHECK (attempt_count >= 0),
  ADD COLUMN IF NOT EXISTS next_attempt_at timestamptz;

ALTER TABLE banking_provider_events
  DROP CONSTRAINT IF EXISTS banking_provider_events_status_check;

ALTER TABLE banking_provider_events
  ADD CONSTRAINT banking_provider_events_status_check
  CHECK (status IN ('received', 'processing', 'processed', 'failed'));

ALTER TABLE banking_provider_events
  DROP CONSTRAINT IF EXISTS banking_provider_events_processing_lease_check;

ALTER TABLE banking_provider_events
  ADD CONSTRAINT banking_provider_events_processing_lease_check
  CHECK (
    (status = 'processing' AND processing_token IS NOT NULL AND processing_started_at IS NOT NULL)
    OR
    (status <> 'processing' AND processing_token IS NULL AND processing_started_at IS NULL)
  );

CREATE INDEX IF NOT EXISTS banking_provider_events_recovery_idx
  ON banking_provider_events (environment, status, next_attempt_at, received_at);

CREATE INDEX IF NOT EXISTS banking_provider_events_processing_lease_idx
  ON banking_provider_events (environment, processing_started_at)
  WHERE status = 'processing';
