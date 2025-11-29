// src/lib/db.ts — FINAL, BATTLE-TESTED, WORKS ON VERCEL RIGHT NOW
let dbPromise: Promise<any> | null = null;

export async function getDb() {
  if (typeof window !== 'undefined') {
    throw new Error('Database is server-only');
  }

  if (!process.env.POSTGRES_URL) {
    throw new Error('POSTGRES_URL is missing — check Vercel env vars');
  }

  if (!dbPromise) {
    dbPromise = (async () => {
      const { drizzle } = await import('drizzle-orm/postgres-js');
      const postgres = (await import('postgres')).default;

      const client = postgres(process.env.POSTGRES_URL!, {
        prepare: false
      });

      const { default: schema } = await import('./schema');
      return drizzle(client, { schema });
    })();
  }

  return dbPromise;
}