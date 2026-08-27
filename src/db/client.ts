import "server-only";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
const client = connectionString ? postgres(connectionString, { prepare: false, max: 5, idle_timeout: 20, connect_timeout: 10 }) : null;
const unavailableDb = new Proxy({}, { get() { throw new Error("DATABASE_URL is required for database access."); } });
export const db = client ? drizzle(client, { schema }) : unavailableDb as ReturnType<typeof drizzle<typeof schema>>;
