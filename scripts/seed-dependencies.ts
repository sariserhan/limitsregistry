import "dotenv/config";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required.");
const sql = postgres(url, { prepare: false });
const edges = [
  ["LR-DRAFT-ALG-22", "LR-DRAFT-ALG-02", "DEPENDS_ON"],
  ["LR-DRAFT-ALG-27", "LR-DRAFT-ALG-19", "DEPENDS_ON"],
  ["LR-DRAFT-ALG-06", "LR-DRAFT-ALG-04", "IMPROVES"],
  ["LR-DRAFT-ALG-17", "LR-DRAFT-ALG-01", "GENERALIZES"],
  ["LR-DRAFT-ALG-24", "LR-DRAFT-ALG-07", "DEPENDS_ON"],
  ["LR-DRAFT-MAT-13", "LR-DRAFT-GRAPHENE", "IMPROVES"],
  ["LR-DRAFT-MAT-14", "LR-DRAFT-MAT-02", "IMPROVES"],
  ["LR-DRAFT-MAT-24", "LR-DRAFT-MAT-18", "GENERALIZES"],
  ["LR-DRAFT-BIO-10", "LR-DRAFT-GENOME", "GENERALIZES"],
  ["LR-DRAFT-BIO-12", "LR-DRAFT-BIO-02", "DEPENDS_ON"],
  ["LR-DRAFT-BIO-13", "LR-DRAFT-BIO-08", "GENERALIZES"],
  ["LR-DRAFT-BIO-29", "LR-DRAFT-BIO-21", "IMPROVES"],
  ["LR-DRAFT-ALG-30", "LR-DRAFT-ALG-19", "DEPENDS_ON"],
  ["LR-DRAFT-ALG-28", "LR-DRAFT-ALG-10", "DEPENDS_ON"],
  ["LR-DRAFT-ALG-18", "LR-DRAFT-ALG-19", "DEPENDS_ON"],
  ["LR-DRAFT-ALG-21", "LR-DRAFT-ALG-10", "GENERALIZES"],
  ["LR-DRAFT-MAT-22", "LR-DRAFT-MAT-05", "IMPROVES"],
  ["LR-DRAFT-MAT-13", "LR-DRAFT-MAT-01", "GENERALIZES"],
  ["LR-DRAFT-MAT-20", "LR-DRAFT-MAT-06", "GENERALIZES"],
  ["LR-DRAFT-MAT-27", "LR-DRAFT-MAT-08", "GENERALIZES"],
  ["LR-DRAFT-BIO-30", "LR-DRAFT-BIO-02", "DEPENDS_ON"],
  ["LR-DRAFT-BIO-11", "LR-DRAFT-BIO-03", "GENERALIZES"],
  ["LR-DRAFT-BIO-24", "LR-DRAFT-BIO-06", "DEPENDS_ON"],
  ["LR-DRAFT-BIO-23", "LR-DRAFT-BIO-16", "GENERALIZES"],
  ["LR-DRAFT-ALG-04", "LR-DRAFT-ALG-15", "DEPENDS_ON"],
  ["LR-DRAFT-ALG-06", "LR-DRAFT-ALG-15", "DEPENDS_ON"],
  ["LR-DRAFT-ALG-13", "LR-DRAFT-ALG-11", "GENERALIZES"],
  ["LR-DRAFT-ALG-25", "LR-DRAFT-ALG-26", "GENERALIZES"],
  ["LR-DRAFT-ALG-20", "LR-DRAFT-ALG-10", "IMPROVES"],
  ["LR-DRAFT-ALG-29", "LR-DRAFT-ALG-10", "DEPENDS_ON"],
  ["LR-DRAFT-MAT-30", "LR-DRAFT-MAT-09", "GENERALIZES"],
  ["LR-DRAFT-MAT-16", "LR-DRAFT-MAT-09", "GENERALIZES"],
  ["LR-DRAFT-MAT-25", "LR-DRAFT-MAT-03", "GENERALIZES"],
  ["LR-DRAFT-MAT-17", "LR-DRAFT-MAT-16", "DEPENDS_ON"],
  ["LR-DRAFT-BIO-15", "LR-DRAFT-BIO-29", "DEPENDS_ON"],
  ["LR-DRAFT-BIO-27", "LR-DRAFT-BIO-18", "DEPENDS_ON"]
] as const;
async function main() {
  const numbers = [...new Set(edges.flatMap(([source, target]) => [source, target]))];
  const limitRows = await Promise.all(numbers.map((number) => sql`select id, registry_number from limits where registry_number = ${number}`));
  const limits = limitRows.flat();
  const ids = new Map(limits.map((row) => [row.registry_number, row.id]));
  let inserted = 0;
  for (const [sourceNumber, targetNumber, relation] of edges) {
    const source = ids.get(sourceNumber), target = ids.get(targetNumber);
    if (!source || !target) throw new Error("Missing Limit: " + sourceNumber + " -> " + targetNumber);
    const rows = await sql`insert into limit_dependencies (source_limit_id, target_limit_id, relation, review_status) values (${source}, ${target}, ${relation}, ${"ACCEPTED"}) on conflict (source_limit_id, target_limit_id, relation) do nothing returning id`;
    inserted += rows.length;
  }
  console.log(JSON.stringify({ inserted, requested: edges.length, resolvedLimits: limits.length }));
  await sql.end();
}
void main().catch((error) => { console.error(error); process.exitCode = 1; });
