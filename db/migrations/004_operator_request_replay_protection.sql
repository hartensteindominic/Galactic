-- One-time provider-sandbox operator request identifiers.
-- This prevents a valid HMAC-authenticated admin request from being replayed
-- during its timestamp validity window, including across serverless instances.

CREATE TABLE IF NOT EXISTS banking_operator_requests (
  request_id text PRIMARY KEY,
  environment text NOT NULL CHECK (environment IN ('provider_sandbox', 'production')),
  operator_id text NOT NULL,
  request_path text NOT NULL,
  request_hash_sha256 text NOT NULL CHECK (request_hash_sha256 ~ '^[a-f0-9]{64}$'),
  signature_timestamp_ms bigint NOT NULL,
  received_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  CHECK (expires_at > received_at)
);

CREATE INDEX IF NOT EXISTS banking_operator_requests_expiry_idx
  ON banking_operator_requests (environment, expires_at);

-- This table contains request identifiers/hashes only. It must never store the
-- operator signing secret, HMAC signature, provider API keys, or raw request body.
