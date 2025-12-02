<!-- src/routes/+page.svelte — FINAL CRYO-FREEZE EDITION (VIBE UPDATE + INTEL RESTORED) -->
<script lang="ts">
  export let data;
  const jobsList = data.jobs || [];
  let error: string | null = null;
  let vibeFilter: string = 'all';

  // UPDATED VIBE SYSTEM — ADD BIPOLAR CULTURE
  const vibeOrder = ['faang_tier', 'hidden_gem', 'startup_chaos', 'corporate_zombie', 'avoid', 'bipolar_culture'] as const;
  
  const vibeColors: Record<string, string> = {
    faang_tier: 'from-yellow-600 to-orange-600',
    hidden_gem: 'from-cyan-500 to-blue-600',
    startup_chaos: 'from-purple-600 to-pink-700',
    corporate_zombie: 'from-gray-700 to-gray-900',
    avoid: 'from-red-800 to-red-950 border-red-600 animate-pulse',
    bipolar_culture: 'from-blue-600 to-red-600 border-purple-600 animate-pulse-slow'  // mixed duality
  };

  $: filtered = vibeFilter === 'all' 
    ? jobsList 
    : jobsList.filter(j => j.insights?.vibe === vibeFilter);

  // PAGINATION — FREMEN CODEX STYLE
  let currentPage = 1;
  const pageSize = 30;

  $: totalPages = Math.ceil(filtered.length / pageSize);
  $: startItem = (currentPage - 1) * pageSize + 1;
  $: endItem = Math.min(currentPage * pageSize, filtered.length);
  $: paginatedJobs = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  $: if (vibeFilter) currentPage = 1;
</script>

<svelte:head>
  <title>SHOGUN9000K — Career Black Ops Division</title>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Share+Tech+Mono&display=swap" rel="stylesheet">
</svelte:head>

<div class="min-h-screen bg-black text-orange-100 font-['Share_Tech_Mono']">
  <!-- GUILDMASTER HEADER -->
  <header class="text-center py-16 border-b-2 border-orange-900 relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-b from-orange-950/30 to-transparent"></div>
    <h1 class="text-4xl md:text-7xl font-orbitron bg-gradient-to-r from-orange-400 via-red-500 to-yellow-500 bg-clip-text text-transparent mb-4 tracking-widest">
      A SECRET REPORT WITHIN THE GUILD
    </h1>
    <p class="text-2xl md:text-4xl text-orange-300 mb-2">Career Black Ops Division</p>
    <p class="text-lg md:text-2xl text-orange-500 mb-6">Battlefield Intelligence Reports • The Spice Must Flow</p>
    <div class="text-orange-600 animate-pulse text-sm md:text-base">
      {jobsList.length} classified reports harvested • {new Date().toLocaleDateString()}
    </div>
  </header>

  <!-- VIBE FILTERS — FLUID & FLAWLESS -->
  <div class="flex flex-wrap justify-center gap-6 py-10 px-6"> 
    <button
      on:click={() => vibeFilter = 'all'}
      class="px-10 py-4 rounded-full font-bold text-lg min-w-fit transition-all shadow-2xl
             {vibeFilter === 'all' ? 'bg-orange-600 text-black ring-4 ring-orange-400 scale-110' : 'bg-gray-800 hover:bg-gray-700 text-orange-200'}">
      ALL VIBES
    </button>
    {#each vibeOrder as vibe}
      {@const label = vibe.replace('_', ' ').toUpperCase()}
      <button
        on:click={() => vibeFilter = vibe}
        class="px-10 py-4 rounded-full font-bold text-lg min-w-fit bg-gradient-to-r {vibeColors[vibe]} text-white shadow-2xl transition-all hover:scale-110 {vibeFilter === vibe ? 'ring-4 ring-white/50 scale-115' : ''}">
        {label}
      </button>
    {/each}
  </div>

  <!-- MAIN GRID + PAGINATION -->
  <div class="max-w-7xl mx-auto px-4 pb-20">
    {#if filtered.length === 0}
      <div class="text-center py-32">
        <h2 class="text-5xl font-orbitron text-orange-500 mb-8">
          {jobsList.length === 0 ? 'STANDBY MODE' : 'NO REPORTS MATCH FILTER'}
        </h2>
        <p class="text-2xl text-gray-400">
          {jobsList.length === 0 
            ? 'Pipeline harvesting... await the wormsign.' 
            : 'No truths match this vibe, Fremen.'}
        </p>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        {#each paginatedJobs as job (job.id)}
          {@const vibe = job.insights?.vibe || 'avoid'}
          {@const color = vibeColors[vibe] || 'from-gray-600 to-gray-800'}

          <div class="group relative bg-gradient-to-br {color} p-8 rounded-3xl border-2 border-orange-900/60 shadow-2xl hover:shadow-orange-500/60 transition-all duration-500 hover:scale-105 hover:-translate-y-2 overflow-hidden">
            <div class="absolute inset-0 bg-black/25 rounded-3xl"></div>
            <div class="relative z-10">
              <span class="inline-block px-4 py-2 mb-4 text-xs font-black uppercase tracking-widest rounded-full bg-black/70 border border-orange-600">
                {vibe.replace('_', ' ')}
              </span>

              <h3 class="text-2xl font-bold text-white mb-3 leading-tight line-clamp-2">{job.title || 'CLASSIFIED'}</h3>
              <p class="text-orange-200 text-lg font-medium mb-2">{job.company || 'Stealth Entity'}</p>
              <p class="text-orange-300 mb-6">{job.location || 'Remote / Unknown'}</p>

              {#if job.insights?.summary}
                <blockquote class="italic text-orange-100 text-sm leading-relaxed border-l-4 border-orange-500 pl-4 mb-6">
                  “{job.insights.summary}”
                </blockquote>
              {/if}

              <!-- FLAGS — RESTORED INTELLIGENCE REPORT -->
              <div class="flex flex-wrap gap-2 mb-6">
                {#each (job.insights?.red_flags || []).filter(Boolean) as flag}
                  <span class="px-3 py-1 bg-red-950/90 text-red-300 text-xs border border-red-700 rounded-full animate-pulse">WARNING: {flag}</span>
                {/each}
                {#each (job.insights?.green_flags || []).filter(Boolean) as flag}
                  <span class="px-3 py-1 bg-green-950/80 text-green-300 text-xs border border-green-700 rounded-full">POSITIVE: {flag}</span>
                {/each}
              </div>

              {#if job.salary_raw && job.salary_raw !== 'Not listed'}
                <div class="text-yellow-300 font-bold text-lg mb-6">{job.salary_raw}</div>
              {:else}
                <div class="text-red-400 font-bold mb-6 relative group/salary">
                  SALARY HIDDEN
                  <span class="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-900 text-white text-xs px-3 py-1 rounded opacity-0 group-hover/salary:opacity-100 transition whitespace-nowrap z-50">
                    Red flag: Hidden salary = negotiation hell
                  </span>
                </div>
              {/if}

              <!-- PERFECTLY ALIGNED APPLY BUTTON -->
              <a 
                href={job.url} 
                target="_blank" 
                rel="noopener"
                class="block text-center px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-orange-400 transition text-lg shadow-lg hover:shadow-orange-500/50 w-full max-w-xs mx-auto mt-8">
                APPLY → INFILTRATE
              </a>
            </div>
          </div>
        {/each}
      </div>

      <!-- FREMEN CODEX PAGINATION -->
      {#if totalPages > 1}
        <div class="flex flex-col items-center gap-8 py-12">
          <div class="flex gap-8">
            <button on:click={() => currentPage--} disabled={currentPage === 1}
              class="px-12 py-4 rounded-full font-bold text-xl transition-all disabled:opacity-40
                     {currentPage === 1 ? 'bg-gray-800 text-gray-600' : 'bg-orange-600 text-black hover:bg-orange-500 hover:scale-110 shadow-2xl'}">
              ← PREV
            </button>
            <button on:click={() => currentPage++} disabled={currentPage === totalPages}
              class="px-12 py-4 rounded-full font-bold text-xl transition-all disabled:opacity-40
                     {currentPage === totalPages ? 'bg-gray-800 text-gray-600' : 'bg-orange-600 text-black hover:bg-orange-500 hover:scale-110 shadow-2xl'}">
              NEXT →
            </button>
          </div>

          <div class="flex gap-3 flex-wrap justify-center">
            {#each Array(totalPages) as _, i}
              {@const page = i + 1}
              <button on:click={() => currentPage = page}
                class="w-14 h-14 rounded-full font-bold text-lg transition-all
                       {currentPage === page ? 'bg-orange-600 text-black ring-4 ring-orange-400 scale-125 shadow-2xl' : 'bg-gray-800 hover:bg-gray-700 text-orange-300 hover:scale-110'}">
                {page}
              </button>
            {/each}
          </div>

          <p class="text-orange-400 font-medium text-lg">
            Page <span class="text-orange-600 font-bold">{currentPage}</span> of <span class="text-orange-600 font-bold">{totalPages}</span>
            • {startItem}–{endItem} of {filtered.length} reports shown
            • {jobsList.length} total truths harvested
          </p>
        </div>
      {/if}
    {/if}
  </div>

  <!-- FOOTER -->
  <footer class="text-center py-10 border-t border-orange-900 text-orange-600 text-sm">
    SHOGUN9000K • {new Date().getFullYear()} • The Spice Must Flow • Cryo-Frozen v1.0
  </footer>
</div>

<style>
  .line-clamp-2 { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .animate-pulse-slow { animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
</style>