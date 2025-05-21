import { parseReadme } from '$lib/server/readmeParser.js';
import fs from 'fs/promises'; // Using fs/promises for async file reading
import path from 'path';

/** @type {import('./$types').PageServerLoad} */
export async function load({ platform }) {
  try {
    // Construct the absolute path to README.md
    // SvelteKit runs code in a specific build directory, so direct relative paths might be tricky.
    // Using process.cwd() to get the current working directory, assuming it's the project root.
    // In a real SvelteKit app, you might place README.md in the `static` folder or handle paths more robustly.
    const readmePath = path.join(process.cwd(), 'README.md');
    
    const readmeContent = await fs.readFile(readmePath, 'utf-8');
    const games = parseReadme(readmeContent);
    
    return {
      games: games
    };
  } catch (error) {
    console.error("Error loading README.md or parsing it:", error);
    // Return an empty array or an error state if preferred
    return {
      games: [],
      error: "Failed to load portfolio data."
    };
  }
}
