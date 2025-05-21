/**
 * Parses the README.md content to extract game information.
 * @param {string} readmeContent The content of README.md.
 * @returns {Array<{title: string, gameUrl: string, codeUrl: string}>} An array of game objects.
 */
export function parseReadme(readmeContent) {
  const games = [];
  const gameSections = readmeContent.split('## ').slice(1); // Skip the first part before the first game

  for (const section of gameSections) {
    const lines = section.split('\\n');
    const title = lines[0].trim();
    let gameUrl = '';
    let codeUrl = '';

    for (const line of lines) {
      if (line.startsWith('- Game:')) {
        gameUrl = line.replace('- Game:', '').trim();
      } else if (line.startsWith('- Code:')) {
        codeUrl = line.replace('- Code:', '').trim();
      }
    }

    if (title && gameUrl && codeUrl) {
      games.push({ title, gameUrl, codeUrl });
    }
  }

  return games;
}

// Example usage with the provided README content:
// const readmeContent = `
// ### Hi there 👋
//
// # Create Games
// The game is published as [Turkey inc](https://unityroom.com/users/turkey_inc29) on unityroom.
// I am creating systems, writing program, etc.
//
// Here are links and repositories to each game.
//
// ## Hopper Man (2D)
// - Game: https://unityroom.com/games/hopper-man
// - Code: https://github.com/kannan-xiao4/20170424_gameaweek_hopper
//
// ## Toku(徳) Simulator
// - Game: https://unityroom.com/games/toku-simulator
// - Code: https://github.com/kannan-xiao4/20170501_tokuwotsumu
//
// ## Shinya Kinmu (深夜勤務) 2
// - Game: https://unityroom.com/games/shinyakinmu2
// - Code: https://github.com/kannan-xiao4/20210502_shinyakinmu
//
// ## Hopper Man (3D)
// - Game: https://unityroom.com/games/hopper-man3d
// - Code: https://github.com/kannan-xiao4/hopper-man-3d
//
// ## Jinsei wo Bou ni Furu (人生を棒に振る)
// - Game: https://unityroom.com/games/jinsei-boufuri
// - Code: https://github.com/kannan-xiao4/20230625_jinsei_boufuru
//
// ## One Button Cooking (1ボタン食堂)
// - Game: https://unityroom.com/games/onebuttoncooking
// - Code: https://github.com/kannan-xiao4/20230918_cooking_onebutton
//
// ## Loading Santa's Presents (俺がプレゼントを積み込むことでサンタが一人、子供のもとへ行ける。俺はそういうことに幸せを感じるんだ。)
// - Game: https://unityroom.com/games/loading-santas-presents
// - Code: https://github.com/kannan-xiao4/20231224_loading_santas_presents
//
// ## Santenpo (ガチャ！加工！換金！)
// - Game: https://unityroom.com/games/santenpo
// - Code: https://github.com/kannan-xiao4/20240324_santenpo
//
// <!--
// **kannan-xiao4/kannan-xiao4** is a ✨ _special_ ✨ repository because its \`README.md\` (this file) appears on your GitHub profile.
//
// Here are some ideas to get you started:
//
// - 🔭 I’m currently working on ...
// - 🌱 I’m currently learning ...
// - 👯 I’m looking to collaborate on ...
// - 🤔 I’m looking for help with ...
// - 💬 Ask me about ...
// - 📫 How to reach me: ...
// - 😄 Pronouns: ...
// - ⚡ Fun fact: ...
// -->
// `;
//
// const parsedGames = parseReadme(readmeContent);
// console.log(parsedGames);
//
// Expected output:
// [
//   {
//     title: 'Hopper Man (2D)',
//     gameUrl: 'https://unityroom.com/games/hopper-man',
//     codeUrl: 'https://github.com/kannan-xiao4/20170424_gameaweek_hopper'
//   },
//   {
//     title: 'Toku(徳) Simulator',
//     gameUrl: 'https://unityroom.com/games/toku-simulator',
//     codeUrl: 'https://github.com/kannan-xiao4/20170501_tokuwotsumu'
//   },
//   {
//     title: 'Shinya Kinmu (深夜勤務) 2',
//     gameUrl: 'https://unityroom.com/games/shinyakinmu2',
//     codeUrl: 'https://github.com/kannan-xiao4/20210502_shinyakinmu'
//   },
//   {
//     title: 'Hopper Man (3D)',
//     gameUrl: 'https://unityroom.com/games/hopper-man3d',
//     codeUrl: 'https://github.com/kannan-xiao4/hopper-man-3d'
//   },
//   {
//     title: 'Jinsei wo Bou ni Furu (人生を棒に振る)',
//     gameUrl: 'https://unityroom.com/games/jinsei-boufuri',
//     codeUrl: 'https://github.com/kannan-xiao4/20230625_jinsei_boufuru'
//   },
//   {
//     title: 'One Button Cooking (1ボタン食堂)',
//     gameUrl: 'https://unityroom.com/games/onebuttoncooking',
//     codeUrl: 'https://github.com/kannan-xiao4/20230918_cooking_onebutton'
//   },
//   {
//     title: "Loading Santa's Presents (俺がプレゼントを積み込むことでサンタが一人、子供のもとへ行ける。俺はそういうことに幸せを感じるんだ。)",
//     gameUrl: 'https://unityroom.com/games/loading-santas-presents',
//     codeUrl: 'https://github.com/kannan-xiao4/20231224_loading_santas_presents'
//   },
//   {
//     title: 'Santenpo (ガチャ！加工！換金！)',
//     gameUrl: 'https://unityroom.com/games/santenpo',
//     codeUrl: 'https://github.com/kannan-xiao4/20240324_santenpo'
//   }
// ]
