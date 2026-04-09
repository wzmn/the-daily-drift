import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/engine/schema.ts",
  out: "./drizzle",
  dialect: "postgresql", // Ensure this is exactly 'postgresql'
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});