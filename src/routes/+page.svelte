<script lang="ts">
  import { onMount } from 'svelte';
  import { db } from '$lib/db';
  import { jobs } from '$lib/schema';

  let jobsList: any[] = [];
  let error = '';

  onMount(async () => {
    try {
      // First — raw count to prove connection
      const countResult = await db.execute(sql`SELECT COUNT(*) FROM jobs`);
      console.log('DB COUNT:', countResult);

      // Then real query
      jobsList = await db.select().from(jobs).orderBy(jobs.scrapedAt, 'desc').limit(200);
      console.log('JOBS LOADED:', jobsList.length);
    } catch (e: any) {
      error = e.message;
      console.error('DB ERROR:', e);
    }
  });
</script>

{#if error}
  <div class="text-red-500 text-center p-20 text-3xl">
    DB ERROR: {error}
  </div>
{:else if jobsList.length === 0}
  <div class="text-orange-500 text-center p-20 text-3xl">
    LOADING SPICE… ({jobsList.length} jobs)
  </div>
{:else}
  <!-- your normal grid -->
{/if}