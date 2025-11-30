<!-- src/routes/+page.svelte — FREMEN RIDER EDITION (NOV 2025) -->
<script lang="ts">
  export let data;
  const jobsList = data.jobs || [];
  let error: string | null = null;
  let vibeFilter: string = 'all';

  const vibeOrder = ['faang_tier', 'hidden_gem', 'startup_chaos', 'corporate_zombie', 'avoid'] as const;
  
  const vibeColors: Record<string, string> = {
    faang_tier: 'from-yellow-600 to-orange-600',
    hidden_gem: 'from-cyan-500 to-blue-600',
    startup_chaos: 'from-purple-600 to-pink-600',
    corporate_zombie: 'from-gray-700 to-gray-900',
    avoid: 'from-red-800 to-red-950 border-red-600 animate-pulse'
  };

  $: filtered = vibeFilter === 'all' 
    ? jobsList 
    : jobsList.filter(j => j.insights?.vibe === vibeFilter);

  $: console.log('SPICEFLOW — Jobs loaded:', jobsList.length);
</script>

<svelte:head>
  <title>SHOGUN9000K — Career Black Ops Division</title>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Share+Tech+Mono&display=swap" rel="stylesheet">
</svelte:head>

<div class="min-h-screen bg-black text-orange-100 font-['Share_Tech_Mono']">
  <!-- Header — Guildmaster Dune Vibe -->
  <header class="text-center py-12 border-b border-orange-900 relative overflow-hidden">
    <div class="absolute inset-0 bg-gradient-to-r from-orange-900/20 to-red-900/20"></div>
    <h1 class="text-4xl md:text-6xl font-orbitron bg-gradient-to-r from-orange-400 via-red-500 to-yellow-400 bg-clip-text text-transparent relative z-10 mb-2">
      A SECRET REPORT WITHIN THE GUILD
    </h1>
    <p class="text-2xl md:text-3xl text-orange-300 relative z-10 mb-1">Career Black Ops Division</p>
    <p class="text-lg md:text-xl text-orange-500 relative z-10">Battlefield Intelligence Reports • The Spice Must Flow</p>
    <div class="mt-4 text-sm text-orange-700 relative z-10 animate-pulse">Harvested: {jobsList.length} truths from the matrix</div>
  </header>

  <!-- Vibe Filters — Fluid Alignment -->
  <div class="flex flex-wrap justify-center gap-2 py-8 px-4 min-h-[60px]">
    <button
      on:click={() => vibeFilter = 'all'}
      class="px-6 py-3 rounded-full font-bold transition-all min-w-fit {vibeFilter === 'all' ? 'bg-orange-600 text-black ring-2 ring-orange-400' : 'bg-gray-800 hover:bg-gray-700 text-orange-200'}">
      All Vibes
    </button>
    {#each vibeOrder as vibe}
      {@const label = vibe.replace('_', ' ').toUpperCase()}
      <button
        on:click={() => vibeFilter = vibe}
        class="px-6 py-3 rounded-full font-bold min-w-fit bg-gradient-to-r {vibeColors[vibe]} text-white shadow-lg transition-all hover:scale-105 {vibeFilter === vibe ? 'ring-2 ring-orange-400 scale-105' : ''}">
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
            Pipeline harvesting... or check Vercel logs for matrix glitches.
          {:else}
            Adjust your vibe filter, Fremen. The truth is there.
          {/if}
        </p>
        <p class="text-sm text-orange-600 mt-8">Total harvested: {jobsList.length} | Last scrape: {new Date().toLocaleString()}</p>
      </div>
    {:else}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each filtered as job (job.id)}
          {@const vibe = job.insights?.vibe || 'avoid'}
          {@const color = vibeColors[vibe] || 'from-gray-600 to-gray-800'}
          <div class="group relative bg-gradient-to-br {color} p-6 rounded-2xl border-2 border-orange-900/50 shadow-2xl hover:shadow-orange-600/50 transition-all duration-300 hover:scale-105 overflow-hidden">
            <div class="absolute inset-0 bg-black opacity-20 rounded-2xl"></div>
            <div class="relative z-10">
              <!-- Vibe Badge -->
              <span class="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full mb-3 {vibeColors[vibe]} text-white">
                {vibe.replace('_', ' ').toUpperCase()}
              </span>
              
              <h3 class="text-xl font-bold text-white mb-2 line-clamp-2">{job.title || 'Classified Role'}</h3>
              <p class="text-orange-200 font-medium mb-1">{job.company || 'Stealth Corp'}</p>
              <p class="text-sm text-orange-300 mb-3">{job.location || 'Remote / Unknown'}</p>

              {#if job.insights?.summary}
                <blockquote class="italic text-sm text-orange-100 mb-4 border-l-4 border-orange-500 pl-3">
                  "{job.insights.summary}"
                </blockquote>
              {/if}

              <!-- Flags -->
              <div class="flex flex-wrap gap-1 mb-4">
                {#each (job.insights?.red_flags || []).filter(Boolean) as flag}
                  <span class="px-2 py-1 bg-red-950/80 text-red-300 text-xs border border-red-800 rounded animate-pulse">
                    ⚠️ {flag}
                  </span>
                {/each}
                {#each (job.insights?.green_flags || []).filter(Boolean) as flag}
                  <span class="px-2 py-1 bg-green-950/80 text-green-300 text-xs border border-green-800 rounded">
                    ✓ {flag}
                  </span>
                {/each}
              </div>

              <!-- Salary — With Red Flag Tooltip -->
              {#if job.salary_raw && job.salary_raw !== 'Not listed'}
                <p class="text-sm text-yellow-300 mb-4 font-medium">{job.salary_raw}</p>
              {:else}
                <p class="text-sm text-red-400 mb-4 font-medium relative">
                  Not listed <span class="absolute bottom-full left-0 bg-red-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">Red flag: Hidden salary = negotiation hell</span>
                </p>
              {/if}

              <a href={job.url} target="_blank" rel="noopener" class="inline-block px-4 py-2 bg-white text-black rounded font-bold hover:bg-orange-400 transition w-full text-center">
                APPLY → INFILTRATE
              </a>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <!-- Footer -->
  <footer class="text-center py-8 border-t border-orange-900 text-sm text-orange-600">
    SHOGUN9000K • {new Date().getFullYear()} • The Spice Must Flow • Built for the Fremen
  </footer>
</div>

<style>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
</style>