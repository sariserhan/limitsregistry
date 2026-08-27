import "server-only";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) throw new Error("DATABASE_URL is required for database access.");

const client = postgres(connectionString, { prepare: false, max: 5, idle_timeout: 20, connect_timeout: 10 });
export const db = drizzle(client, { schema });
