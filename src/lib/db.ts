// src/lib/db.ts — SERVER-ONLY DYNAMIC LOADING (fixes bundling forever)
let db: any = null;

export async function getDb() {
  if (typeof window !== 'undefined') {
    throw new Error('DB is server-only — use +page.server.js or +server.ts');
  }
  if (!db) {
    const { drizzle } from 'drizzle-orm/postgres-js';
    const postgres from 'postgres';
    const client = postgres(process.env.POSTGRES_URL!);
    db = drizzle(client, { schema: (await import('./schema')).default });
  }
  return db;
}