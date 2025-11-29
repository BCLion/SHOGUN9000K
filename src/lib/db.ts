// src/lib/db.ts — 100% WORKING ON VERCEL NOV 2025
let dbPromise: Promise<any> | null = null;

export async function getDb() {
  // Client-side guard
  if (typeof window !== 'undefined') {
    throw new Error('DB is server-only');
  }

  // Runtime guard + loud error if env var missing
  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is missing in environment variables');
  }

  if (!dbPromise) {
    dbPromise = (async () => {
      const { drizzle } = await import('drizzle-orm/postgres-js');
      const postgres = (await import('postgres')).default; // ← this is correct for postgres v3

      const client = postgres(process.env.POSTGRES_URL!, {
        prepare: false // important for Vercel serverless
      });

      const { default: schema } = await import('./schema');

      return drizzle(client, { schema });
    })();
  }

  return dbPromise;
}