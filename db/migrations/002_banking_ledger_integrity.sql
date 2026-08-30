-- Database-level ledger integrity for Galactic Trust.
-- Application checks remain in place, but the database independently rejects
-- incomplete/unbalanced journals and mutation of posted accounting/audit records.

CREATE OR REPLACE FUNCTION galactic_assert_banking_journal_balanced()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  line_count integer;
  debit_total numeric;
  credit_total numeric;
BEGIN
  SELECT COUNT(*), COALESCE(SUM(debit_cents), 0), COALESCE(SUM(credit_cents), 0)
    INTO line_count, debit_total, credit_total
    FROM banking_ledger_lines
   WHERE journal_id = NEW.journal_id;

  IF line_count < 2 THEN
    RAISE EXCEPTION 'banking journal % requires at least two lines', NEW.journal_id;
  END IF;

  IF debit_total <> credit_total THEN
    RAISE EXCEPTION 'banking journal % is out of balance: debits %, credits %', NEW.journal_id, debit_total, credit_total;
  END IF;

  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS banking_journal_balance_guard ON banking_ledger_journals;
CREATE CONSTRAINT TRIGGER banking_journal_balance_guard
AFTER INSERT ON banking_ledger_journals
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW
EXECUTE FUNCTION galactic_assert_banking_journal_balanced();

CREATE OR REPLACE FUNCTION galactic_reject_append_only_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION '% is append-only; write a compensating record instead', TG_TABLE_NAME;
END;
$$;

DROP TRIGGER IF EXISTS banking_ledger_journals_append_only ON banking_ledger_journals;
CREATE TRIGGER banking_ledger_journals_append_only
BEFORE UPDATE OR DELETE ON banking_ledger_journals
FOR EACH ROW
EXECUTE FUNCTION galactic_reject_append_only_mutation();

DROP TRIGGER IF EXISTS banking_ledger_lines_append_only ON banking_ledger_lines;
CREATE TRIGGER banking_ledger_lines_append_only
BEFORE UPDATE OR DELETE ON banking_ledger_lines
FOR EACH ROW
EXECUTE FUNCTION galactic_reject_append_only_mutation();

DROP TRIGGER IF EXISTS banking_audit_events_append_only ON banking_audit_events;
CREATE TRIGGER banking_audit_events_append_only
BEFORE UPDATE OR DELETE ON banking_audit_events
FOR EACH ROW
EXECUTE FUNCTION galactic_reject_append_only_mutation();
