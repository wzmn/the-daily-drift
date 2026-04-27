import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db"; // Your Drizzle/Supabase connection
import * as schema from "./schema";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg",
        schema: {
            ...schema
        }
    }),
    emailAndPassword: {
        enabled: true // Allows you to log in with your admin credentials
    },
    trustedOrigins: [
        "https://thedailydraft.xyz",
        "https://www.thedailydraft.xyz",
        "http://localhost:3000" // Keep this for local dev
    ],
    // 2026 Feature: Rate limiting to prevent brute force on your bot dashboard
    rateLimit: {
        enabled: true,
        max: 10, 
    },
    baseURL: process.env.BETTER_AUTH_URL || "http://localhost:3000"
});
