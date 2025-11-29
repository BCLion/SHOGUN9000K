// src/routes/+page.server.ts
import type { PageServerLoad } from '@sveltejs/kit';
import { db } from '$lib/db';
import { jobs } from '$lib/schema';
import { desc } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
  const allJobs = await db
    .select()
    .from(jobs)
    .orderBy(desc(jobs.scrapedAt))   // ← correct way
    .limit(500);

  return { jobs: allJobs };
};





// ORIG CODE BEFORE NEON - 2025-11-29 //
// // src/routes/+page.server.ts — FINAL, NO SQUIGGLES, NO $TYPES DRAMA
// // import type { ServerLoad } from '$app/types'; //
// import type { ServerLoad } from '@sveltejs/kit';
// import { getDb } from '$lib/db';
// import { jobs } from '$lib/schema';

// export const load: ServerLoad = async () => {
//   const db = await getDb();
//   const allJobs = await db
//     .select()
//     .from(jobs)
//     .orderBy(jobs.scrapedAt, 'desc')
//     .limit(300);

//   return { jobs: allJobs };
// };