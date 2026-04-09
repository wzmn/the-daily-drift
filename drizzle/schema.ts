import { pgTable, serial, text, pgPolicy, bigint, timestamp, jsonb, varchar } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const testConnection = pgTable("test_connection", {
	id: serial().primaryKey().notNull(),
	name: text(),
});

export const news = pgTable("news", {
	// You can use { mode: "bigint" } if numbers are exceeding js number limitations
	id: bigint({ mode: "number" }).primaryKey().generatedByDefaultAsIdentity({ name: "news_id_seq", startWith: 1, increment: 1, minValue: 1, maxValue: 9223372036854775807, cache: 1 }),
	createdAt: timestamp("created_at", { withTimezone: true, mode: 'string' }).defaultNow().notNull(),
	title: text(),
	newsData: jsonb("news_data"),
	imageUrl: text("image_url"),
	status: varchar(),
}, (table) => [
	pgPolicy("All Access", { as: "permissive", for: "all", to: ["public"], using: sql`true` }),
]);
