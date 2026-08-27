-- The publication guard trigger (0009_watchlists-notifications.sql) only checked
-- source_entity_type='CLAIM', so a published watchlist_events row sourced from a breakthrough
-- event (source_entity_type='BREAKTHROUGH_EVENT') had no database-level check that its Claim is
-- ACCEPTED and its Limit is public — persistBreakthroughEvents' own app-level guard was the only
-- protection. This extends the same trigger to cover breakthrough-sourced rows too, joining
-- through breakthrough_events to the same claim/limit publication check.
CREATE OR REPLACE FUNCTION enforce_published_watchlist_event() RETURNS trigger LANGUAGE plpgsql AS $$ DECLARE claim_ok boolean; BEGIN
  IF NEW.published_at IS NOT NULL AND NEW.source_entity_type='CLAIM' THEN SELECT EXISTS(SELECT 1 FROM claims c JOIN limit_spec_versions s ON s.id=c.specification_version_id JOIN limits l ON l.id=s.limit_id WHERE c.id::text=NEW.source_entity_id AND c.status='ACCEPTED' AND l.status IN ('OPEN','PROVEN') AND l.id=NEW.limit_id) INTO claim_ok; IF NOT claim_ok THEN RAISE EXCEPTION 'Published Claim events require an accepted Claim on a public Limit'; END IF; END IF;
  IF NEW.published_at IS NOT NULL AND NEW.source_entity_type='BREAKTHROUGH_EVENT' THEN SELECT EXISTS(SELECT 1 FROM breakthrough_events b JOIN claims c ON c.id=b.claim_id JOIN limit_spec_versions s ON s.id=c.specification_version_id JOIN limits l ON l.id=s.limit_id WHERE b.id::text=NEW.source_entity_id AND c.status='ACCEPTED' AND l.status IN ('OPEN','PROVEN') AND l.id=NEW.limit_id) INTO claim_ok; IF NOT claim_ok THEN RAISE EXCEPTION 'Published breakthrough events require an accepted Claim on a public Limit'; END IF; END IF;
  RETURN NEW;
END $$;