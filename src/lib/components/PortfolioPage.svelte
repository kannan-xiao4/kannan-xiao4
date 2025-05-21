<script>
  /**
   * @type {Array<{title: string, gameUrl: string, codeUrl: string}>}
   */
  export let games = [];
</script>

<style>
  .portfolio-container {
    display: flex;
    flex-direction: column;
    gap: 20px; /* Spacing between game entries */
  }

  .game-entry {
    background-color: #f9f9f9; /* Light background for each entry */
    padding: 20px; /* Increased padding */
    border: 1px solid #e0e0e0; /* Slightly darker border */
    border-radius: 8px; /* More rounded corners */
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05); /* Subtle shadow */
    transition: box-shadow 0.3s ease;
  }

  .game-entry:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Enhanced shadow on hover */
  }

  .game-entry h3 {
    margin-top: 0;
    margin-bottom: 12px; /* Space below title */
    font-size: 1.5em; /* Larger font size for title */
    color: #333;
  }

  .game-links a {
    display: inline-block; /* Allows for padding and better spacing */
    margin-right: 15px; /* Spacing between links */
    padding: 8px 12px; /* Padding within links for better clickability */
    background-color: #007bff; /* Primary button color */
    color: white; /* Link text color */
    text-decoration: none;
    border-radius: 4px;
    font-size: 0.9em;
    transition: background-color 0.3s ease;
  }

  .game-links a:hover {
    background-color: #0056b3; /* Darker shade on hover */
    text-decoration: none;
  }

  .no-games {
    color: #555;
    font-style: italic;
  }
</style>

<div class="portfolio-container">
  {#if games.length === 0}
    <p class="no-games">No games to display.</p>
  {:else}
    {#each games as game}
      <div class="game-entry">
        <h3>{game.title}</h3>
        <div class="game-links">
          <a href={game.gameUrl} target="_blank" rel="noopener noreferrer">Play Game</a>
          <a href={game.codeUrl} target="_blank" rel="noopener noreferrer">View Code</a>
        </div>
      </div>
    {/each}
  {/if}
</div>
