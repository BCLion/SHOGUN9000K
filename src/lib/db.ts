// src/lib/db.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.POSTGRES_URL!;

if (typeof window !== 'undefined') {
  // Client-side: throw error or return dummy
  throw new Error('DB not available on client');
}

const client = postgres(connectionString);
export const db = drizzle(client);