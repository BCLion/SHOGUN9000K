<!-- src/routes/+page.svelte — SPICEFLOW FINAL FORM -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { db } from '$lib/db';
  import { jobs } from '$lib/schema';

  let jobsList: any[] = [];
  let vibeFilter = 'all';

  const vibeOrder = ['faang_tier', 'hidden_gem', 'startup_chaos', 'corporate_zombie', 'avoid'];
  const vibeColors = {
    faang_tier: 'from-yellow-600 to-orange-600',
    hidden_gem: 'from-cyan-500 to-blue-600',
    startup_chaos: 'from-purple-600 to-pink-600',
    corporate_zombie: 'from-gray-700 to-gray-900',
    avoid: 'from-red-800 to-red-950 border-red-600 animate-pulse'
  };

  onMount(async () => {
    jobsList = await db.select().from(jobs).orderBy(jobs.scrapedAt, 'desc').limit(200);
  });

  $: filtered = vibeFilter === 'all' 
    ? jobsList 
    : jobsList.filter(j => j.insights?.vibe === vibeFilter);
</script>

<svelte:head>
  <title>SPICEFLOW — Career Black Ops Division</title>
  <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@900&family=Share+Tech+Mono&display=swap" rel="stylesheet">
</svelte:head>

<div class="min-h-screen bg-black text-orange-500 font-['Share_Tech_Mono']">
  <!-- Header -->
  <header class="text-center py-16 border-b-4 border-orange-800">
    <h1 class="text-8xl font-orbitron tracking-wider glitch" data-text="SPICEFLOW">
      SPICEFLOW
    </h1>
    <p class="text-2xl mt-4 opacity-90">Career Black Ops Division</p>
    <p class="text-lg mt-2 text-orange-400">Battlefield Intelligence Reports • The Spice Must Flow</p>
  </header>

  <!-- Vibe Filters -->
  <div class="flex justify-center gap-4 my-12 flex-wrap">
    {#each ['all', ...vibeOrder] as vibe}
      {@const label = vibe === 'all' ? 'All Vibes' : vibe.replace('_', ' ').toUpperCase()}
      <button
        class="px-8 py-4 rounded-full text-lg font-bold transition-all transform hover:scale-110
               {vibeFilter === vibe ? 'bg-orange-600 text-black shadow-2xl shadow-orange-600/50' : 'bg-gray-900 border-2 border-orange-800'}"
        on:click={() => vibeFilter = vibe}>
        {label}
      </button>
    {/each}
  </div>

  <!-- Job Grid -->
  <div class="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20 px-4">
    {#each filtered as job (job.id)}
      <div class="group relative overflow-hidden rounded-xl border-2 {vibeColors[job.insights?.vibe || 'corporate_zombie']} 
                  bg-gradient-to-br from-black/90 transform hover:-translate-y-2 transition-all duration-500">
        <div class="absolute inset-0 bg-gradient-to-br {vibeColors[job.insights?.vibe || 'corporate_zombie']} opacity-20 group-hover:opacity-40"></div>
        
        <div class="relative p-8">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-2xl font-bold text-orange-400">{job.title}</h3>
            <span class="text-4xl font-orbitron">{job.insights?.match_score || '??'}%</span>
          </div>
          
          <p class="text-xl text-cyan-300 mb-2">{job.company}</p>
          <p class="text-gray-400 mb-6">{job.city} • {job.location}</p>

          <p class="italic text-orange-300 text-lg mb-6">"{job.insights?.summary || 'Classified'} "</p>

          <div class="flex flex-wrap gap-2 mb-6">
            {#each (job.insights?.red_flags || []).filter(Boolean) as flag}
              <span class="px-3 py-1 bg-red-950/80 text-red-400 text-sm border border-red-800 rounded">⚠️ {flag}</span>
            {/each}
            {#each (job.insights?.green_flags || []).filter(Boolean) as flag}
              <span class="px-3 py-1 bg-green-950/80 text-green-400 text-sm border border-green-800 rounded">✓ {flag}</span>
            {/each}
          </div>

          <a href={job.url} target="_blank" class="inline-block mt-4 text-cyan-400 hover:text-cyan-300 text-lg font-bold">
            → INFILTRATE TARGET
          </a>
        </div>
      </div>
    {/each}
  </div>
</div>

<style>
  .glitch {
    animation: glitch 4s infinite;
  }
  @keyframes glitch {
    0% { text-shadow: 0 0 20px #ff6200; }
    20% { text-shadow: 0 0 30px #ffaa00, 0 0 40px #ff6200; }
    40% { text-shadow: -5px 0 0 #00ffff, 5px 0 0 #ff00ff; }
    100% { text-shadow: 0 0 20px #ff6200; }
  }
</style>