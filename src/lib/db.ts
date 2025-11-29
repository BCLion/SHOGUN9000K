// src/lib/db.ts
import { drizzle } from 'drizzle-orm/vercel-postgres';
import { sql } from '@vercel/postgres';
import * as schema from './schema';
// New
// src/lib/db.ts
// import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// This is the ONLY line that matters
const connectionString = import.meta.env.PROD 
  ? process.env.POSTGRES_URL! 
  : import.meta.env.POSTGRES_URL || process.env.POSTGRES_URL!;

const client = postgres(connectionString);
// export const db = drizzle(client);


// End New

export const db = drizzle(sql, { schema });