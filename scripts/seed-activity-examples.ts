import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required.");

const examples = [
  { registryNumber: "LR-001000", title: "Editorial example: challenge the reference-value scope", description: "Demonstration entry showing how a contributor can question whether the published specification distinguishes a recommended value from a formally proven exact value. This example is not an accepted Claim.", relation: ">=", value: "7294.299 541 70", source: "https://physics.nist.gov/cuu/Constants/", type: "CORRECTION" },
  { registryNumber: "LR-001001", title: "Editorial example: reproduce the mass measurement", description: "Demonstration entry for a reproducibility challenge. A real submission would attach the method, data, uncertainty treatment, and an independently checkable result.", relation: ">=", value: "6.644 657 3449e-27", source: "https://physics.nist.gov/cuu/Constants/", type: "REPRODUCTION" },
  { registryNumber: "LR-001004", title: "Editorial example: test the unit conversion", description: "Demonstration entry showing a proposed stronger bound tied to a specific unit representation. It remains pending editorial review and does not change the canonical record.", relation: ">=", value: "4.001 506 179 128", source: "https://physics.nist.gov/cuu/Constants/", type: "STRONGER_BOUND" },
] as const;

const sql = postgres(url, { prepare: false, max: 1 });

async function main() {
try {
  await sql.begin(async (tx) => {
    const [submitter] = await tx`insert into "user" (id, name, email, email_verified, role) values ('registry-editorial-examples', 'Limits Registry editorial desk', 'editorial-examples@limitsregistry.com', true, 'USER') on conflict (email) do update set name = excluded.name returning id`;
    for (const example of examples) {
      const [limit] = await tx`select id from limits where registry_number = ${example.registryNumber} limit 1`;
      if (!limit) throw new Error(`Limit not found: ${example.registryNumber}`);
      const [existing] = await tx`select id from submissions where title = ${example.title} limit 1`;
      if (existing) continue;
      await tx`insert into submissions (submitter_user_id, limit_id, submission_type, title, description, proposed_relation, proposed_value_exact, evidence_url, status) values (${submitter.id}, ${limit.id}, ${example.type}, ${example.title}, ${example.description}, ${example.relation}, ${example.value}, ${example.source}, 'SUBMITTED')`;
    }
  });
  console.log(`Seeded ${examples.length} idempotent Activity examples.`);
} finally {
  await sql.end();
}
}

main().catch((error) => { console.error(error); process.exit(1); });
