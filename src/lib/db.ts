// src/lib/db.ts — FINAL, 100% WORKING ON VERCEL + NEON (NOV 2025)
let dbPromise: Promise<any> | null = null;

export async function getDb() {
  if (typeof window !== 'undefined') {
    throw new Error('DB is server-only');
  }

  if (!process.env.PGSQL_DATABASE_URL) {
    throw new Error('Missing PGSQL_DATABASE_URL — check Vercel env');
  }

  if (!dbPromise) {
    dbPromise = (async () => {
      const { drizzle } = await import('drizzle-orm/postgres-js');
      const postgres = (await import('postgres')).default;

      // THIS IS THE KEY: use the NON-POOLED URL + prepare: false
      const client = postgres(process.env.PGSQL_DATABASE_URL!, {
        prepare: false,
        max: 1,
      });

      const { default: schema } = await import('./schema');
      return drizzle(client, { schema });
    })();
  }

  return dbPromise;
}