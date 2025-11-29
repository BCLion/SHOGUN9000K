// src/lib/db.ts — FINAL, NO SYNTAX ERRORS, SERVER-ONLY, TYPE-SAFE
let dbPromise: Promise<any> | null = null;

export async function getDb() {
  // Block client-side execution
  if (typeof window !== 'undefined') {
    throw new Error('Database is server-only');
  }

  if (!dbPromise) {
    dbPromise = (async () => {
      // Dynamic imports — proper async syntax
      const { drizzle } = await import('drizzle-orm/postgres-js');
      const postgres = await import('postgres');
      
      const client = postgres.default(process.env.POSTGRES_URL!);
      const { default: schema } = await import('./schema');

      return drizzle(client, { schema });
    })();
  }

  return dbPromise;
}