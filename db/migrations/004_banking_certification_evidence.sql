-- Append-only provider-sandbox certification evidence bundles.
-- Evidence contains sanitized/hardened manifests, never provider secrets or raw PII.

CREATE TABLE IF NOT EXISTS banking_certification_evidence (
  bundle_id text PRIMARY KEY,
  certification_run_id text NOT NULL,
  environment text NOT NULL CHECK (environment = 'provider_sandbox'),
  provider text NOT NULL,
  evidence_key_id text NOT NULL,
  generated_at timestamptz NOT NULL,
  manifest jsonb NOT NULL,
  manifest_sha256 text NOT NULL CHECK (manifest_sha256 ~ '^[a-f0-9]{64}$'),
  hmac_sha256 text NOT NULL CHECK (hmac_sha256 ~ '^[a-f0-9]{64}$'),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (environment, certification_run_id, manifest_sha256)
);

CREATE INDEX IF NOT EXISTS banking_certification_evidence_run_idx
  ON banking_certification_evidence (environment, certification_run_id, generated_at DESC);

DROP TRIGGER IF EXISTS banking_certification_evidence_append_only ON banking_certification_evidence;
CREATE TRIGGER banking_certification_evidence_append_only
BEFORE UPDATE OR DELETE ON banking_certification_evidence
FOR EACH ROW
EXECUTE FUNCTION galactic_reject_append_only_mutation();
