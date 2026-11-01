import fs from 'node:fs';
import path from 'node:path';
import MarkdownIt from 'markdown-it';

const config = JSON.parse(fs.readFileSync('site/config.json', 'utf8'));
const base = (process.env.SITE_BASE_PATH ?? config.basePath).replace(/\/$/, '');
const url = (p = '') => `${base}/${p}`;
const absolute = p => `${config.origin}${url(p)}`;
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const md = new MarkdownIt({ html: false, linkify: true, typographer: true });
const slug = s => s.toLowerCase().replace(/[^\p{L}\p{N}_\-\s]/gu, '').replace(/\s/g, '-');
const docs = [
  { file: 'career', title: '経歴・技術実績', label: 'EXPERIENCE', description: 'Unity・C++・WebRTCから、プロダクト開発とチームマネジメントまで。' },
  { file: 'personal-projects', title: '個人制作', label: 'SIDE PROJECTS', description: 'Turkey incとして公開している8つのゲーム。遊べる作品とソースコード。' },
  { file: 'approach', title: '開発・チーム運営の考え', label: 'PERSPECTIVE', description: '開発基盤、育成、権限移譲。作り手が本来の仕事に集中できる環境をつくる。' }
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
const nav = [['', 'Home'], ['docs/career.html', 'About'], ['docs/personal-projects.html', 'Works'], ['blog/', 'Blog'], ['links/', 'Links']];
function shell(title, description, route, content, active = route) {
  return `<!doctype html>
<html lang="ja"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title === config.name ? title : `${title} — ${config.name}`)}</title><meta name="description" content="${esc(description)}">
<link rel="canonical" href="${absolute(route)}"><meta property="og:type" content="${route.startsWith('blog/') && route !== 'blog/' ? 'article' : 'website'}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${absolute(route)}"><meta property="og:locale" content="ja_JP">
<link rel="icon" href="${url('assets/favicon.svg')}" type="image/svg+xml"><link rel="stylesheet" href="${url('assets/style.css')}"><link rel="alternate" type="application/rss+xml" title="${config.name} Blog" href="${url('feed.xml')}"></head>
<body><a class="skip" href="#main">本文へスキップ</a><header class="header"><a class="wordmark" href="${url()}">tk<span> / </span>Takashi Kannan</a><nav aria-label="メインナビゲーション">${nav.map(([p,label]) => `<a href="${url(p)}"${p === active ? ' aria-current="page"' : ''}>${label}</a>`).join('')}</nav></header>
<main id="main">${content}</main><footer><div><a class="wordmark" href="${url()}">Takashi Kannan<span> / </span></a><p>プロダクト開発と、チームづくりの記録。</p></div><div class="footer-links"><a href="https://github.com/kannan-xiao4">GitHub ↗</a><a href="${url('feed.xml')}">RSS ↗</a><a href="${url('links/')}">Links ↗</a></div><small>© ${new Date().getFullYear()} Takashi Kannan</small></footer></body></html>`;
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
const postRows = items => items.length ? items.map(p => `<a class="post-row" href="${url(`blog/${p.file}.html`)}"><div class="post-date"><time datetime="${p.date}">${p.date.replaceAll('-', '.')}</time><span>${esc(p.category)}</span></div><div><h3>${esc(p.title)}</h3><p>${esc(p.description)}</p></div><span class="arrow" aria-hidden="true">↗</span></a>`).join('') : '<p class="muted">記事は準備中です。</p>';
const linkCards = config.links.map(link => `<a class="link-card" href="${esc(link.url)}"><span class="eyebrow">${esc(link.label)}</span><h2>${esc(link.name)} <span aria-hidden="true">↗</span></h2><p>${esc(link.description)}</p><span class="link-domain">${esc(new URL(link.url).hostname)}</span></a>`).join('');
write('', config.name, config.description, `
<section class="hero"><div><p class="eyebrow"><span class="dot"></span> SOFTWARE ENGINEER / ENGINEERING MANAGER</p><h1>つくる。<br>つくる人を、<br><span>支える。</span></h1><p class="hero-copy">技術とチームの両面から、<br>プロダクトを前へ。</p><p class="intro">Takashi Kannan / Unity・C++・WebRTCを軸に、<br class="desktop">プロダクト開発とチームづくりに取り組んでいます。</p><a class="button" href="${url('docs/career.html')}">プロフィールを読む <span>↗</span></a></div>
<aside class="hero-note"><span class="note-number">01 — PROFILE</span><div class="monogram" aria-hidden="true">tk<span>.</span></div><div class="note-bottom"><span>CODE × PRODUCT × PEOPLE</span><p>領域をつなぎ、<br>つくるための環境を整える。</p><a href="https://github.com/kannan-xiao4">@kannan-xiao4 ↗</a></div></aside></section>
<section class="section"><div class="section-heading"><div><p class="eyebrow">EXPLORE</p><h2>これまでと、これから。</h2></div><span class="section-caption">仕事 / 制作 / 考えていること</span></div><div class="explore">${docs.map((doc,i) => `<a class="explore-item" href="${url(`docs/${doc.file}.html`)}"><span class="item-number">0${i+1}</span><span class="eyebrow">${doc.label}</span><h3>${doc.title} <span>↗</span></h3><p>${doc.description}</p></a>`).join('')}</div></section>
<section class="section writing"><div class="section-heading"><div><p class="eyebrow">WRITING</p><h2>開発のそばで、考える。</h2></div><a class="text-link" href="${url('blog/')}">記事一覧 <span>↗</span></a></div>${postRows(posts.slice(0,3))}</section>
<section class="elsewhere"><p class="eyebrow">ELSEWHERE</p><h2>コードと、遊べるもの。</h2><p>ソースコード、技術メモ、個人制作のゲームはこちらから。</p><div>${config.links.slice(0,3).map(link => `<a href="${esc(link.url)}">${esc(link.name)} ↗</a>`).join('')}<a href="${url('links/')}">すべてのリンク →</a></div></section>`);
for (const doc of docs) {
  const source = fs.readFileSync(`docs/${doc.file}.md`, 'utf8').replace(/^# .*\r?\n/, '').replace(/\[プロフィールに戻る\]\(\.\.\/README\.md\)\r?\n/, '');
  const { html, headings } = render(source, `docs/${doc.file}.md`);
  write(`docs/${doc.file}.html`, doc.title, doc.description, `<div class="page-heading"><a class="back" href="${url()}">← Home</a><p class="eyebrow">${doc.label}</p><h1>${doc.title}</h1><p>${doc.description}</p></div><div class="reading-layout"><aside class="toc"><p class="eyebrow">ON THIS PAGE</p><nav aria-label="ページ内の目次">${headings.map(h => `<a href="#${esc(h.id)}">${esc(h.title)}</a>`).join('')}</nav></aside><article class="prose">${html}</article></div>`);
}
write('blog/', 'Blog', '開発・チーム運営・学びについての小さな記録。', `<div class="page-heading"><p class="eyebrow">BLOG / NOTES</p><h1>開発のそばで、<br>考える。</h1><p>開発、チーム、学びについての小さな記録。</p><a class="text-link" href="${url('feed.xml')}">RSSで読む ↗</a></div><section class="post-list" aria-label="記事一覧">${postRows(posts)}</section>`);
for (const p of posts) {
  const { html } = render(p.body, p.source);
  write(`blog/${p.file}.html`, p.title, p.description, `<div class="page-heading article-heading"><a class="back" href="${url('blog/')}">← 記事一覧</a><p class="eyebrow">${esc(p.category)} / <time datetime="${p.date}">${p.date.replaceAll('-', '.')}</time></p><h1>${esc(p.title)}</h1><p>${esc(p.description)}</p></div><article class="prose blog-prose">${html}<div class="article-end"><p>Takashi Kannan</p><a href="${url('blog/')}">← 記事一覧へ</a></div></article>`, 'blog/');
}
write('links/', 'Links', 'ソースコード、技術メモ、個人制作と、開発に携わったプロジェクト。', `<div class="page-heading"><p class="eyebrow">AROUND THE WEB</p><h1>コードと、活動の場所。</h1><p>個人の活動と、開発に携わったプロジェクトへのリンク。</p></div><section class="link-grid" aria-label="外部リンク">${linkCards}</section>`);
write('404.html', 'ページが見つかりません', 'ページが見つかりません。', `<div class="page-heading"><p class="eyebrow">404 / NOT FOUND</p><h1>ページが見つかりません。</h1><p>URLが変更されたか、ページが存在しないようです。</p><a class="button" href="${url()}">ホームへ戻る →</a></div>`);
fs.writeFileSync('dist/feed.xml', `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${esc(config.name)} Blog</title><link>${absolute('blog/')}</link><description>${esc(config.description)}</description><language>ja</language>${posts.map(p => `<item><title>${esc(p.title)}</title><link>${absolute(`blog/${p.file}.html`)}</link><guid>${absolute(`blog/${p.file}.html`)}</guid><pubDate>${new Date(`${p.date}T00:00:00+09:00`).toUTCString()}</pubDate><description>${esc(p.description)}</description></item>`).join('')}</channel></rss>`);
fs.writeFileSync('dist/sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${pages.map(p => `<url><loc>${absolute(p)}</loc></url>`).join('')}</urlset>`);
fs.writeFileSync('dist/.nojekyll', '');
console.log(`Built ${pages.length + 1} pages at ${url()} → dist/`);
