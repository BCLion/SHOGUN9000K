<script lang="ts">
  export let data;
  const jobsList = data.jobs || [];

  // ← THIS WAS THE 500 KILLER — DECLARE IT HERE
  let error: string | null = null;
  
  // Rest of your script (vibeFilter, filtered, etc.) stays unchanged
  let vibeFilter = 'all';

  const vibeOrder = ['faang_tier', 'hidden_gem', 'startup_chaos', 'corporate_zombie', 'avoid'];
  const vibeColors = {
    faang_tier: 'from-yellow-600 to-orange-600',
    hidden_gem: 'from-cyan-500 to-blue-600',
    startup_chaos: 'from-purple-600 to-pink-600',
    corporate_zombie: 'from-gray-700 to-gray-900',
    avoid: 'from-red-800 to-red-950 border-red-600 animate-pulse'
  };

  $: filtered = vibeFilter === 'all' ? jobsList : jobsList.filter(j => j.insights?.vibe === vibeFilter);
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