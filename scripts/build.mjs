import fs from 'node:fs';
import path from 'node:path';
import MarkdownIt from 'markdown-it';
import { projects, writeProjectsDoc } from './projects.mjs';

writeProjectsDoc();

const config = JSON.parse(fs.readFileSync('site/config.json', 'utf8'));
const base = (process.env.SITE_BASE_PATH ?? config.basePath).replace(/\/$/, '');
const url = (p = '') => `${base}/${p}`;
const absolute = p => `${config.origin}${url(p)}`;
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const md = new MarkdownIt({ html: false, linkify: true, typographer: true });
const slug = s => s.toLowerCase().replace(/[^\p{L}\p{N}_\-\s]/gu, '').replace(/\s/g, '-');
const docs = [
  { file: 'career', title: '経歴・技術実績', description: 'Unity・C++・WebRTCから、プロダクト開発とチームマネジメントまで。' },
  { file: 'personal-projects', title: '個人制作', description: 'ゲーム、技術サンプル、Webアプリ、開発ツールなどを新しい順に紹介しています。' },
  { file: 'approach', title: '開発・チーム運営の考え', description: '開発基盤、育成、権限移譲。作り手が本来の仕事に集中できる環境をつくる。' }
];
function readPost(file) {
  const raw = fs.readFileSync(`posts/${file}`, 'utf8');
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) throw new Error(`記事のメタデータがありません: ${file}`);
  const data = Object.fromEntries(match[1].split(/\r?\n/).map(line => {
    const split = line.indexOf(':');
    if (split < 1) throw new Error(`メタデータが不正です: ${file}`);
    return [line.slice(0, split).trim(), line.slice(split + 1).trim()];
  }));
  for (const key of ['title', 'date', 'category', 'description']) if (!data[key]) throw new Error(`${file}: ${key}が必要です`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data.date) || Number.isNaN(Date.parse(data.date))) throw new Error(`日付が不正です: ${file}`);
  return { ...data, body: match[2], file: file.replace(/\.md$/, ''), source: `posts/${file}` };
}
const today = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Tokyo' }).format(new Date());
const posts = fs.readdirSync('posts').filter(f => f.endsWith('.md')).map(readPost).filter(p => p.date <= today).sort((a,b) => b.date.localeCompare(a.date) || a.file.localeCompare(b.file));
const pages = [];
fs.rmSync('dist', { recursive: true, force: true });
fs.mkdirSync('dist/assets', { recursive: true });
fs.cpSync('site/assets', 'dist/assets', { recursive: true });
const nav = [['', 'ホーム'], ['docs/career.html', '経歴'], ['docs/personal-projects.html', '個人制作'], ['blog/', 'ブログ'], ['links/', 'リンク']];
const socialLinks = config.socials.map(social => {
  const link = config.links.find(link => link.name === social.name);
  const icon = fs.readFileSync(`site/assets/icons/${social.icon}.svg`, 'utf8').replace('<svg ', '<svg class="material-icon" aria-hidden="true" focusable="false" ');
  return `<a href="${esc(link.url)}">${icon}<span>${esc(link.name)}</span></a>`;
}).join('');
function shell(title, description, route, content, active = route) {
  const home = route === '';
  const identity = `<img src="${url('assets/avatar.png')}" width="40" height="40" alt="GitHubのプロフィール画像"><span>Takashi Kannan</span>`;
  return `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title === config.name ? title : `${title} — ${config.name}`)}</title><meta name="description" content="${esc(description)}">
<link rel="canonical" href="${absolute(route)}"><meta property="og:type" content="${route.startsWith('blog/') && route !== 'blog/' ? 'article' : 'website'}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${absolute(route)}"><meta property="og:locale" content="ja_JP">
<link rel="icon" href="${url('assets/avatar.png')}" type="image/png"><link rel="stylesheet" href="${url('assets/style.css')}"><link rel="alternate" type="application/rss+xml" title="${config.name} Blog" href="${url('feed.xml')}"></head>
<body${home ? ' class="home"' : ''}><a class="skip" href="#main">本文へスキップ</a><header class="header"><a class="wordmark" href="${url()}">${identity}</a><nav aria-label="メインナビゲーション">${nav.map(([p,label]) => `<a href="${url(p)}"${p === active ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav><nav class="social-links" aria-label="ソーシャルプロフィール">${socialLinks}</nav></header>
<main id="main">${content}</main><footer><small>© ${new Date().getFullYear()} Takashi Kannan</small><div class="footer-links social-links">${socialLinks}<a href="${url('feed.xml')}">RSS</a></div></footer></body></html>`;
}
function write(route, title, description, content, active) {
  const target = `dist/${route.endsWith('/') || !route ? `${route}index.html` : route}`;
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, shell(title, description, route, content, active));
  if (route !== '404.html') pages.push(route);
}
function render(source, sourcePath) {
  const tokens = md.parse(source, {});
  const used = new Map();
  const headings = [];
  function walk(items) {
    for (const token of items) {
      if (token.type === 'link_open') {
        const href = token.attrGet('href');
        if (href && !/^(?:[a-z]+:|\/\/|#)/i.test(href)) {
          const [file, hash] = href.split('#');
          const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(sourcePath), file));
          if (resolved === 'README.md') token.attrSet('href', `${url()}${hash ? `#${hash}` : ''}`);
          else if (resolved.endsWith('.md')) {
            const route = resolved.startsWith('posts/') ? `blog/${path.posix.basename(resolved, '.md')}.html` : resolved.replace(/\.md$/, '.html');
            token.attrSet('href', `${url(route)}${hash ? `#${hash}` : ''}`);
          }
        }
      }
      if (token.children) walk(token.children);
    }
  }
  walk(tokens);
  tokens.forEach((token, i) => {
    if (token.type !== 'heading_open') return;
    const title = tokens[i + 1].content;
    const id = slug(title);
    const count = used.get(id) || 0;
    used.set(id, count + 1);
    const unique = `${id}${count ? `-${count}` : ''}`;
    token.attrSet('id', unique);
    if (token.tag === 'h2') headings.push({ title, id: unique });
  });
  return { html: md.renderer.render(tokens, md.options, {}), headings };
}
const postRows = items => items.length ? items.map(p => `<article class="post-row"><div class="post-date"><time datetime="${p.date}">${p.date.replaceAll('-', '.')}</time><span>${esc(p.category)}</span></div><h3><a href="${url(`blog/${p.file}.html`)}">${esc(p.title)}</a></h3><p>${esc(p.description)}</p></article>`).join('') : '<p class="muted">記事は準備中です。</p>';
const linkRows = config.links.map(link => `<div class="link-row"><h2><a href="${esc(link.url)}">${esc(link.name)}</a></h2><p>${esc(link.description)}</p></div>`).join('');
const projectPreviews = projects.slice(0, 4).map(project => `<article class="project-preview${project.image ? ' with-image' : ''}"><div><p class="post-date"><time datetime="${project.date}">${project.date.replaceAll('-', '.')}</time><span>${esc(project.category)}</span></p><h3><a href="${esc(project.repository || project.playUrl)}">${esc(project.title)}</a></h3><p>${esc(project.description)}</p></div>${project.image ? `<a href="${esc(project.playUrl)}" aria-label="${esc(project.title)}をunityroomで見る"><img src="${url(`assets/games/${project.image}`)}" width="112" height="112" alt="${esc(project.title)}のゲーム画像" loading="lazy"></a>` : ''}</article>`).join('');
write('', config.name, config.description, `
<section class="home-intro"><h1>Takashi Kannan</h1><p class="role"><span>ソフトウェアエンジニア /</span> <span>エンジニアリングマネージャー</span></p><img class="home-illustration" src="${url('assets/torimaru-hero.png')}" width="2172" height="724" alt="モニターやノートが並ぶ作業机に、小さなとりまるがいるイラスト" fetchpriority="high"></section>
<section class="home-section" aria-labelledby="profile-heading"><h2 id="profile-heading">プロフィール</h2><div class="home-section-content"><p>Unity・C++・WebRTCを軸に、クライアントからWeb・クラウドまで横断して開発してきました。現在はIRIAMで、プロダクト開発とチームマネジメントに取り組んでいます。</p><dl class="page-list">${docs.filter(doc => doc.file !== 'personal-projects').map(doc => `<div><dt><a href="${url(`docs/${doc.file}.html`)}">${doc.title}</a></dt><dd>${doc.description}</dd></div>`).join('')}</dl></div></section>
<section class="home-section" aria-labelledby="works-heading"><h2 id="works-heading">個人制作</h2><div class="home-section-content"><p class="project-date-note">新しいものから掲載。日付はGitHubのリポジトリ作成日です。</p><div class="project-previews">${projectPreviews}</div><a class="section-more" href="${url('docs/personal-projects.html')}">すべての作品</a></div></section>
<section class="home-section" aria-labelledby="blog-heading"><h2 id="blog-heading">ブログ</h2><div class="home-section-content">${postRows(posts.slice(0,3))}<a class="section-more" href="${url('blog/')}">記事一覧</a></div></section>
<section class="home-section" aria-labelledby="links-heading"><h2 id="links-heading">外部リンク</h2><div class="home-section-content"><ul class="inline-links">${config.links.slice(0,3).map(link => `<li><a href="${esc(link.url)}">${esc(link.name)}</a></li>`).join('')}</ul><a class="section-more" href="${url('links/')}">リンク一覧</a></div></section>`);
for (const doc of docs) {
  const source = fs.readFileSync(`docs/${doc.file}.md`, 'utf8').replace(/^# .*\r?\n/, '').replace(/\[プロフィールに戻る\]\(\.\.\/README\.md\)\r?\n/, '');
  const { html, headings } = render(source, `docs/${doc.file}.md`);
  write(`docs/${doc.file}.html`, doc.title, doc.description, `<div class="page-heading"><h1>${doc.title}</h1></div><details class="toc"><summary>目次</summary><nav aria-label="ページ内の目次">${headings.map(h => `<a href="#${esc(h.id)}">${esc(h.title)}</a>`).join('')}</nav></details><article class="prose">${html}</article>`);
}
write('blog/', 'ブログ', '開発・チーム運営・学びについての記録。', `<div class="page-heading"><h1>ブログ</h1><p>開発・チーム運営・学びについての記録。</p><a href="${url('feed.xml')}">RSS</a></div><section class="post-list" aria-label="記事一覧">${postRows(posts)}</section>`);
for (const p of posts) {
  const { html } = render(p.body, p.source);
  write(`blog/${p.file}.html`, p.title, p.description, `<div class="page-heading article-heading"><a class="back" href="${url('blog/')}">← 記事一覧</a><p class="post-date"><time datetime="${p.date}">${p.date.replaceAll('-', '.')}</time><span>${esc(p.category)}</span></p><h1>${esc(p.title)}</h1><p>${esc(p.description)}</p></div><article class="prose blog-prose">${html}<div class="article-end"><p>Takashi Kannan</p><a href="${url('blog/')}">← 記事一覧へ</a></div></article>`, 'blog/');
}
write('links/', '外部リンク', 'ソースコード、技術メモ、個人制作と、開発に携わったプロジェクト。', `<div class="page-heading"><h1>外部リンク</h1><p>個人の活動と、開発に携わったプロジェクト。</p></div><section class="link-list" aria-label="外部リンク">${linkRows}</section>`);
write('404.html', 'ページが見つかりません', 'ページが見つかりません。', `<div class="page-heading"><h1>ページが見つかりません</h1><p>URLが変更されたか、ページが存在しないようです。</p><a href="${url()}">ホームへ戻る</a></div>`);
fs.writeFileSync('dist/feed.xml', `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${esc(config.name)} Blog</title><link>${absolute('blog/')}</link><description>${esc(config.description)}</description><language>ja</language>${posts.map(p => `<item><title>${esc(p.title)}</title><link>${absolute(`blog/${p.file}.html`)}</link><guid>${absolute(`blog/${p.file}.html`)}</guid><pubDate>${new Date(`${p.date}T00:00:00+09:00`).toUTCString()}</pubDate><description>${esc(p.description)}</description></item>`).join('')}</channel></rss>`);
fs.writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(p => `<url><loc>${absolute(p)}</loc></url>`).join('')}</urlset>`);
fs.writeFileSync('dist/.nojekyll', '');
console.log(`Built ${pages.length + 1} pages at ${url()} → dist/`);
