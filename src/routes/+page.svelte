<!-- src/routes/+page.svelte — FINAL CLEAN VERSION (NOV 2025) -->
<script lang="ts">
  export let data;
  const jobsList = data.jobs || [];

  // Prevents any 500 ReferenceError ever again
  let error: string | null = null;

  // Filters
  let vibeFilter: string = 'all';

  const vibeOrder = ['faang_tier', 'hidden_gem', 'startup_chaos', 'corporate_zombie', 'avoid'] as const;
  
  const vibeColors: Record<string, string> = {
    faang_tier: 'from-yellow-600 to-orange-600',
    hidden_gem: 'from-cyan-500 to-blue-600',
    startup_chaos: 'from-purple-600 to-pink-600',
    corporate_zombie: 'from-gray-700 to-gray-900',
    avoid: 'from-red-800 to-red-950 border-red-600 animate-pulse'
  };

  // Reactive filtered list
  $: filtered = vibeFilter === 'all' 
    ? jobsList 
    : jobsList.filter(j => j.insights?.vibe === vibeFilter);

  // Debug logs — you’ll see these in browser console
  $: console.log('SPICEFLOW CLIENT — Jobs received:', jobsList.length);
  $: if (jobsList.length > 0) console.log('First job →', jobsList[0].title, jobsList[0].company);
</script>

<svelte:head>
  <title>SHOGUN9000K — Underground Job Matrix</title>
  <meta name="description" content="Career Black Ops Division • The Spice Must Flow" />
</svelte:head>

<div class="min-h-screen bg-black text-orange-100">
  <!-- Header -->
  <header class="text-center py-12 border-b border-orange-900">
    <h1 class="text-6xl md:text-8xl font-orbitron bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent">
      SHOGUN9000K
    </h1>
    <p class="mt-4 text-xl md:text-2xl text-orange-400">Career Black Ops Division</p>
    <p class="text-sm text-orange-600">Battlefield Intelligence Reports • The Spice Must Flow</p>
  </header>

  <!-- Vibe Filters -->
  <div class="flex flex-wrap justify-center gap-4 py-8 px-4">
    <button
      on:click={() => vibeFilter = 'all'}
      class="px-8 py-3 rounded-full font-bold transition-all {vibeFilter === 'all' ? 'bg-orange-600 text-black' : 'bg-gray-800 hover:bg-gray-700'}">
      All Vibes
    </button>
    {#each vibeOrder as vibe}
      {@const label = vibe.replace('_', ' ').toUpperCase()}
      <button
        on:click={() => vibeFilter = vibe}
        class="px-8 py-3 rounded-full font-bold bg-gradient-to-r {vibeColors[vibe]} text-white shadow-lg transform transition hover:scale-105 {vibeFilter === vibe ? 'ring-4 ring-orange-400' : ''}">
        {label}
      </button>
    {/each}
  </div>

  <!-- Job Grid -->
  <div class="max-w-7xl mx-auto px-4 pb-20">
    {#if filtered.length === 0}
      <div class="text-center py-20">
        <h2 class="text-5xl font-orbitron text-orange-500 mb-6">
          {#if jobsList.length === 0}
            STANDBY MODE
          {:else}
            NO JOBS MATCH FILTER
          {/if}
        </h2>
        <p class="text-xl text-gray-400">
          {#if jobsList.length === 0}
            Pipeline running or DB connection issue.<br/>Check Vercel logs + browser console.
          {:else}
            Try a different vibe, soldier.
          {/if}
        </p>
        <p class="text-sm text-orange-600 mt-8">
          Debug → {jobsList.length} jobs loaded from black-ops-corp
        </p>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each filtered as job (job.id)}
          {@const vibe = job.insights?.vibe || 'avoid'}
          {@const color = vibeColors[vibe] || 'from-gray-600 to-gray-800'}

          <div class="group relative bg-gradient-to-br {color} p-6 rounded-2xl border-2 border-orange-900/50 shadow-2xl hover:shadow-orange-600/50 transition-all duration-300 hover:scale-105">
            <div class="absolute inset-0 bg-black opacity-30 rounded-2xl"></div>
            <div class="relative z-10">
              <h3 class="text-2xl font-bold text-white mb-2">{job.title || 'Unknown Role'}</h3>
              <p class="text-orange-200 text-lg mb-1">{job.company || 'Stealth Mode'}</p>
              <p class="text-sm text-orange-300 mb-4">{job.location || 'Remote / Classified'}</p>

              {#if job.insights}
                <div class="text-xs space-y-1 mb-4">
                  <p><strong>Vibe:</strong> <span class="text-white">{(job.insights.vibe || 'avoid').replace('_', ' ').toUpperCase()}</span></p>
                  {#if job.insights.red_flags}<p class="text-red-300">Red Flags: {job.insights.red_flags}</p>{/if}
                  {#if job.insights.green_flags}<p class="text-green-300">Green Flags: {job.insights.green_flags}</p>{/if}
                </div>

                <blockquote class="italic text-sm text-orange-100 border-l-4 border-orange-500 pl-4">
                  "{job.insights.summary || 'No intel available'}"
                </blockquote>
              {/if}

              <div class="mt-6 flex justify-between items-center">
                <a href={job.url} target="_blank" rel="noopener"
                   class="px-4 py-2 bg-white text-black rounded font-bold hover:bg-orange-400 transition">
                  APPLY
                </a>
                {#if job.salary_raw}
                  <span class="text-sm bg-black/50 px-3 py-1 rounded">{job.salary_raw}</span>
                {/if}
              </div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Footer -->
  <footer class="text-center py-8 border-t border-orange-900 text-sm text-orange-700">
    SHOGUN9000K • {new Date().getFullYear()} • The Spice Must Flow
  </footer>
</div>