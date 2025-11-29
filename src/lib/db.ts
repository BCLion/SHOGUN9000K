// src/lib/db.ts — SERVER-ONLY
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

if (typeof window !== 'undefined') {
  throw new Error('DB is server-only');
}

const client = postgres(process.env.POSTGRES_URL!);
export const db = drizzle(client, { schema });