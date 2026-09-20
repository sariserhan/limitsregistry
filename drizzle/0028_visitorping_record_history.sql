-- One-time data backfill, guarded by the Drizzle migration journal.
-- VisitorPing human page views through 2026-09-19 UTC, fetched 2026-09-20.
-- September 20 is excluded to avoid overlapping the existing live counters.
-- Exact canonical record paths only; no category, bounty, query or slash merging.
WITH history(target, views) AS (VALUES
  ('LR-001000', 1::bigint),
  ('LR-001002', 1::bigint),
  ('LR-001004', 6::bigint),
  ('LR-001043', 1::bigint),
  ('LR-001095', 1::bigint),
  ('LR-001098', 1::bigint),
  ('LR-001123', 1::bigint),
  ('LR-001157', 1::bigint),
  ('LR-001200', 9::bigint),
  ('LR-001202', 1::bigint),
  ('LR-001229', 1::bigint),
  ('LR-001239', 1::bigint),
  ('LR-002000', 2::bigint),
  ('LR-002008', 1::bigint),
  ('LR-002026', 1::bigint),
  ('LR-002159', 2::bigint),
  ('LR-002229', 2::bigint),
  ('LR-002232', 3::bigint),
  ('LR-002358', 1::bigint),
  ('LR-003016', 1::bigint),
  ('LR-003110', 3::bigint),
  ('LR-003204', 1::bigint),
  ('LR-003215', 1::bigint),
  ('LR-003218', 1::bigint),
  ('LR-003318', 1::bigint),
  ('LR-003515', 4::bigint),
  ('LR-003611', 2::bigint),
  ('LR-003619', 1::bigint),
  ('LR-003636', 1::bigint),
  ('LR-004101', 1::bigint),
  ('LR-100M-MEN', 1::bigint),
  ('LR-AUCTION-PRICE-RECORD', 1::bigint),
  ('LR-BEAL', 2::bigint),
  ('LR-CAP-THEOREM', 3::bigint),
  ('LR-DRAFT-ALG-01', 1::bigint),
  ('LR-DRAFT-ATTENTION', 4::bigint),
  ('LR-DRAFT-BIO-01', 1::bigint),
  ('LR-DRAFT-BIO-10', 1::bigint),
  ('LR-DRAFT-BIO-29', 1::bigint),
  ('LR-DRAFT-COVERING', 2::bigint),
  ('LR-DRAFT-DNA', 2::bigint),
  ('LR-DRAFT-ML', 1::bigint),
  ('LR-DRAFT-NEUTRON', 2::bigint),
  ('LR-DRAFT-OMEGA', 1::bigint),
  ('LR-ITU-AI-SPACE', 2::bigint),
  ('LR-MARATHON-MEN', 1::bigint),
  ('LR-MARKET-CAP-RECORD', 1::bigint),
  ('LR-MICROSOFT-QUANTUM-PIONEERS-2026', 1::bigint),
  ('LR-RAMSEY-5-5', 1::bigint),
  ('LR-RIEMANN', 1::bigint),
  ('LR-VESUVIUS', 3::bigint),
  ('LR-XPRIZE-HEALTHSPAN', 1::bigint),
  ('LR-XPRIZE-QUANTUM', 1::bigint)
)
INSERT INTO public_view_counts (kind, target, views, started_at)
SELECT 'LIMIT', history.target, history.views, '2026-08-28T00:00:00Z'::timestamptz
FROM history
JOIN limits ON limits.registry_number = history.target
WHERE limits.status IN ('OPEN', 'PROVEN', 'DISPUTED', 'RETIRED')
ON CONFLICT (kind, target) DO UPDATE
SET views = public_view_counts.views + EXCLUDED.views,
    started_at = LEAST(public_view_counts.started_at, EXCLUDED.started_at);
