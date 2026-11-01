import fs from 'node:fs';

// Markdown remains the source of the text. This renderer changes only its Web presentation.
export function renderReading(source, { md, esc, url }) {
  const covers = JSON.parse(fs.readFileSync('site/reading-covers.json', 'utf8'));
  const coverByTitle = new Map(covers.map(book => [book.title, book]));
  const groups = [];
  let current;
  const sections = source.split(/(?=^## |^### )/m);
  const intro = sections.shift();
  const plain = text => md.parseInline(text, {})[0].children.filter(t => ['text', 'code_inline'].includes(t.type)).map(t => t.content).join('');
  const entries = [];
  for (const section of sections) {
    if (section.startsWith('## ')) {
      current = { title: section.split('\n')[0].slice(3), books: [] };
      groups.push(current);
      continue;
    }
    if (!section.startsWith('### ') || !current) continue;
    const [heading, ...rest] = section.trim().split('\n');
    const inline = md.parseInline(heading.slice(4), {})[0].children;
    const title = plain(heading.slice(4));
    const bookUrl = inline.find(t => t.type === 'link_open')?.attrGet('href');
    const blocks = rest.join('\n').trim().split(/\n\s*\n/);
    const author = blocks.shift();
    const status = blocks.shift();
    const review = blocks.join('\n\n');
    if (!/^著者(?:候補)?：/.test(author) || !/^(?:書籍|Web小説) · /.test(status)) throw new Error(`読書記録の形式を確認してください: ${title}`);
    const book = { title, bookUrl, author, status, review, year: current.title, number: entries.length + 1 };
    current.books.push(book);
    entries.push(book);
  }
  const yearNav = groups.map((group, i) => `<a href="#reading-year-${i}">${esc(group.title)}</a>`).join('');
  function card(book) {
    const cover = coverByTitle.get(book.title);
    const hasCover = cover?.cover && cover.coverRights?.status === 'permitted';
    const host = book.bookUrl ? new URL(book.bookUrl).hostname : '';
    const siteName = cover?.siteName || host;
    const icon = cover?.siteIcon?.file ? `<img class="book-site-icon" src="${url(`assets/site-icons/${cover.siteIcon.file}`)}" alt="" width="32" height="32" loading="lazy">` : '<span class="book-link-symbol" aria-hidden="true">↗</span>';
    const fallback = `<span class="book-link-preview">${icon}<span>${esc(siteName || '書籍情報')}</span><span class="book-preview-label">${book.bookUrl ? '紹介ページ ↗' : 'リンク未登録'}</span></span>`;
    const image = hasCover ? `<img src="${url(`assets/book-covers/${cover.cover}`)}" alt="『${esc(book.title)}』の表紙" width="124" height="176" loading="lazy" decoding="async">` : fallback;
    const visual = book.bookUrl ? `<a class="book-cover${hasCover ? '' : ' book-cover-link'}" href="${esc(book.bookUrl)}" aria-label="${esc(book.title)}の書籍情報：${esc(siteName)}">${image}</a>` : `<div class="book-cover">${image}</div>`;
    const credit = hasCover ? `<p class="book-image-credit">出版社：${esc(cover.publisher)}<br><a href="${esc(cover.coverSource)}">表紙出典：${esc(cover.coverProvider === 'openBD' ? 'openBD' : cover.publisher)}</a></p>` : '';
    const title = book.bookUrl ? `<a href="${esc(book.bookUrl)}">${esc(book.title)}</a>` : esc(book.title);
    const noteOnly = /^(?:読了の記録のみ|読みたい本として記録|読み切れていない、という記録)/.test(book.review);
    const review = noteOnly ? `<p class="book-empty-note">${esc(book.review)}</p>` : `<details class="book-review"><summary>感想・メモを読む</summary><div class="prose">${md.render(book.review)}</div></details>`;
    return `<article class="book-card" data-book data-year="${esc(book.year)}" data-status="${esc(book.status.split(' · ')[1])}" aria-labelledby="book-${book.number}"><div class="book-card-heading">${visual}<div class="book-info"><p class="book-status">${esc(book.status.split(' · ')[1])}</p><h3 id="book-${book.number}">${title}</h3><p class="book-author">${md.renderInline(book.author)}</p>${credit}${book.bookUrl ? `<a class="book-source" href="${esc(book.bookUrl)}">${esc(siteName)} ↗</a>` : ''}</div></div>${review}</article>`;
  }
  const content = `<div class="page-heading reading-heading"><p class="reading-kicker">BOOKS & NOTES</p><h1>読書記録</h1><p>技術や組織・マネジメントの本から、SFなどの小説まで。<br>読んだ本と、そのとき考えたことを残しています。</p><p class="book-count" id="reading-count" role="status" aria-live="polite">${entries.length}件の記録</p></div>
<div class="reading-tools"><div><label for="reading-query">書名・著者・感想から探す</label><input id="reading-query" type="search" placeholder="書名や著者名を入力" autocomplete="off"></div><div><label for="reading-state">読書状況</label><select id="reading-state"><option value="">すべて</option value="読了">読了</option value="既読">既読</option><option value="読書中">読書中</option><option value="一部読了">一部読了</option><option value="読みたい">読みたい</option></select></div></div>
<nav class="reading-year-nav" aria-label="年別の読書記録">${yearNav}</nav>
<p class="reading-cover-note">表紙は書籍紹介用です。読んだ版・巻と異なる場合があります。感想にはネタバレを含みます。</p>
<p id="reading-empty" class="muted" hidden>条件に合う記録がありません。検索語や読書状況を変えてください。</p>
${groups.map((group, i) => `<section class="reading-year" data-year-section aria-labelledby="reading-year-${i}"><h2 id="reading-year-${i}">${esc(group.title)}<span>${group.books.length}件</span></h2><div class="book-grid">${group.books.map(card).join('')}</div></section>`).join('')}
<details class="reading-about"><summary>この記録について</summary><div class="prose">${md.render(intro)}</div><p>表紙は<a href="https://openbd.jp/terms/">openBD</a>、または<a href="https://www.chikumashobo.co.jp/contact/">筑摩書房</a>の利用条件に基づき掲載しています。その他は紹介先サイトのアイコンとリンクを表示しています。</p></details>
<script src="${url('assets/reading.js')}" defer></script>`;
  return { content, entries };
}
