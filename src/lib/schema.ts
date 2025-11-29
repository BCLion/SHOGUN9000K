// src/lib/schema.ts — CLEAN, TYPE-SAFE, SINGLE TABLE (SPICEFLOW READY)
import { pgTable, serial, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

// Define the jobs table (matches your ingest.py exactly)
export const jobs = pgTable('jobs', {
  id: serial('id').primaryKey(),
  title: text('title'),
  company: text('company'),
  location: text('location'),
  url: text('url').unique(),
  salary_raw: text('salary_raw'),
  description: text('description'),
  city: text('city'),
  insights: jsonb('insights'),
  scrapedAt: timestamp('scraped_at').defaultNow(),
  enrichedAt: timestamp('enriched_at'),
});

// Export as default — exactly what getDb() expects
export default { jobs };