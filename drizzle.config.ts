// drizzle.config.ts (root)
import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config();  // Load .env for local dev

export default defineConfig({
  dialect: 'postgresql',  // Canonical for Vercel Postgres test
  schema: './src/lib/schema.ts',
  out: './drizzle',
  dbCredentials: {
    url: process.env.POSTGRES_URL!,  // Single URL from Vercel (postgres://...)
  },
});