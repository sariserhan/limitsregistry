/** Read-only: lists accounts with REVIEWER+ role, to pick a reviewerUserId for accept-codata-review.ts. */
import "dotenv/config";
import postgres from "postgres";
const connectionString = process.env.DATABASE_URL; if (!connectionString) throw new Error("DATABASE_URL is required.");
const sql = postgres(connectionString, { prepare: false, max: 2 });

async function main() {
  const rows = await sql`select id, email, role from "user" where role in ('REVIEWER','EDITOR','ADMIN','SUPERADMIN') order by role desc, email`;
  for (const r of rows) console.log(JSON.stringify(r));
  await sql.end();
}
main();
