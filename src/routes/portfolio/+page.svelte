<script>
  import PortfolioPage from '$lib/components/PortfolioPage.svelte';

  /** @type {import('./$types').PageData} */
  export let data;
</script>

<svelte:head>
  <title>My Game Portfolio</title>
  <meta name="description" content="A collection of games I've created." />
</svelte:head>

<h1>Game Portfolio</h1>

{#if data.error}
  <p style="color: red;">{data.error}</p>
{:else if data.games && data.games.length > 0}
  <PortfolioPage games={data.games} />
{:else}
  <p>No game projects found or there was an issue loading them.</p>
{/if}
