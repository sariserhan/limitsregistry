import { randomUUID } from "node:crypto";
import postgres from "postgres";
import { afterAll, describe, expect, it } from "vitest";

const url = process.env.BOUNTY_TEST_DATABASE_URL ?? process.env.SEARCH_TEST_DATABASE_URL;
const sql = url ? postgres(url, { prepare: false, max: 1 }) : null;

afterAll(async () => { await sql?.end(); });

describe.skipIf(!sql)("bounty PostgreSQL integration", () => {
  it("enforces validation and exposes only verified, unexpired bounties on public Limits", async () => {
    const limitId = randomUUID();
    const draftId = randomUUID();
    const expiredId = randomUUID();
    const registryNumber = `LR-B-${limitId.slice(0, 8)}`;
    const publicRows = () => sql!`
      select b.id
      from research_bounties b
      join limits l on l.id = b.limit_id
      where b.limit_id = ${limitId}
        and b.status = 'VERIFIED'
        and (b.expires_at is null or b.expires_at > now())
        and l.status in ('OPEN', 'PROVEN')`;

    try {
      await sql!`insert into limits (id, registry_number, slug, title, summary, category, direction, metric_name, status) values (${limitId}, ${registryNumber}, ${`bounty-${limitId}`}, 'Bounty fixture', 'test', 'test', 'MINIMIZE', 'test', 'OPEN')`;

      await expect(sql!`insert into research_bounties (limit_id, title, sponsor, description, source_url, amount, currency) values (${limitId}, 'Invalid source', 'Sponsor', 'A sufficiently long fixture description.', 'http://example.com', '100', 'USD')`).rejects.toMatchObject({ code: "23514" });
      await expect(sql!`insert into research_bounties (limit_id, title, sponsor, description, source_url, amount, currency) values (${limitId}, 'Invalid currency', 'Sponsor', 'A sufficiently long fixture description.', 'https://example.com', '100', 'usd')`).rejects.toMatchObject({ code: "23514" });
      await expect(sql!`insert into research_bounties (limit_id, title, sponsor, description, source_url, amount) values (${limitId}, 'Unpaired amount', 'Sponsor', 'A sufficiently long fixture description.', 'https://example.com', '100')`).rejects.toMatchObject({ code: "23514" });
      await expect(sql!`insert into research_bounties (limit_id, title, sponsor, description, source_url, amount, currency) values (${limitId}, 'Invalid amount', 'Sponsor', 'A sufficiently long fixture description.', 'https://example.com', '0', 'USD')`).rejects.toMatchObject({ code: "23514" });
      await expect(sql!`insert into research_bounties (limit_id, title, sponsor, description, source_url, status) values (${limitId}, 'Invalid status', 'Sponsor', 'A sufficiently long fixture description.', 'https://example.com', 'PUBLISHED')`).rejects.toMatchObject({ code: "23514" });

      await sql!`insert into research_bounties (id, limit_id, title, sponsor, description, source_url, amount, currency, status, expires_at) values (${draftId}, ${limitId}, 'Current bounty', 'Sponsor', 'A sufficiently long fixture description.', 'https://example.com/current', '1000', 'USD', 'UNVERIFIED', now() + interval '30 days')`;
      expect(await publicRows()).toHaveLength(0);

      await sql!`update research_bounties set status = 'VERIFIED', verified_at = now() where id = ${draftId}`;
      expect(await publicRows()).toEqual([{ id: draftId }]);

      await sql!`insert into research_bounties (id, limit_id, title, sponsor, description, source_url, status, expires_at) values (${expiredId}, ${limitId}, 'Expired bounty', 'Sponsor', 'A sufficiently long fixture description.', 'https://example.com/expired', 'VERIFIED', now() - interval '1 day')`;
      expect(await publicRows()).toEqual([{ id: draftId }]);

      await sql!`update limits set status = 'DRAFT' where id = ${limitId}`;
      expect(await publicRows()).toHaveLength(0);
    } finally {
      await sql!`delete from research_bounties where limit_id = ${limitId}`;
      await sql!`delete from limits where id = ${limitId}`;
    }
  });
});
