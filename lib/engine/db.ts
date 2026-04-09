import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema"; // We will create this next!

// Your Supabase connection string (Found in Supabase Settings > Database)
const connectionString = process.env.DATABASE_URL!;

// Disable prefetch as it is not supported for "Transaction" mode in Supabase/Pools
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });