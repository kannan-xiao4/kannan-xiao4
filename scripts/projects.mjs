import fs from 'node:fs';

export const projects = JSON.parse(fs.readFileSync('site/projects.json', 'utf8'))
  .sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));

export function writeProjectsDoc() {
  let markdown = '# 個人制作\n\n[プロフィールに戻る](../README.md)\n\n';
  markdown += 'ゲーム、技術サンプル、Webアプリ、開発ツール、学習コードを新しいものから順にまとめています。\n\n';
  markdown += '日付はGitHubのリポジトリ作成日（日本時間）を基準にしています。制作期間や最終更新日を表すものではありません。GitHubの公開リポジトリを確認できないゲームは、unityroomの投稿日を記載しています。\n\n';
  markdown += 'ゲームは[Turkey inc](https://unityroom.com/users/turkey_inc29)としてunityroomでも公開しています。\n\n';
  let year;
  for (const project of projects) {
    if (project.date.slice(0, 4) !== year) {
      year = project.date.slice(0, 4);
      markdown += `## ${year}年\n\n`;
    }
    markdown += `### ${project.title}\n\n`;
    markdown += `**${project.date}** · ${project.category}${project.archived ? ' · アーカイブ' : ''}${project.dateSource === 'unityroom投稿日' ? ' · unityroom投稿日' : ''}\n\n`;
    markdown += `${project.description}\n\n`;
    const links = [];
    if (project.repository) links.push(`[GitHub](${project.repository})`);
    if (project.playUrl) links.push(`[ゲームで遊ぶ](${project.playUrl})`);
    markdown += `${links.join(' / ')}\n\n`;
  }
  markdown += '[GitHubの公開リポジトリ一覧](https://github.com/kannan-xiao4?tab=repositories&type=public)\n';
  fs.writeFileSync('docs/personal-projects.md', markdown);
}
