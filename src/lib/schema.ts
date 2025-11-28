// src/lib/schema.ts
import { pgTable, serial, text, timestamp, jsonb } from 'drizzle-orm/pg-core';

export const jobs = pgTable('jobs', {
  id: serial('id').primaryKey(),
  title: text('title'),
  company: text('company'),
  location: text('location'),
  url: text('url').unique(),
  salaryRaw: text('salary_raw'),
  description: text('description'),
  city: text('city'),
  insights: jsonb('insights'),
  scrapedAt: timestamp('scraped_at').defaultNow(),
  enrichedAt: timestamp('enriched_at'),
});

export type Job = typeof jobs.$inferSelect;
export type NewJob = typeof jobs.$inferInsert;