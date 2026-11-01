import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const config = JSON.parse(fs.readFileSync('site/config.json', 'utf8'));
const base = (process.env.SITE_BASE_PATH ?? config.basePath).replace(/\/$/, '');
function files(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(f => f.isDirectory() ? files(path.join(dir, f.name)) : [path.join(dir, f.name)]); }
const pages = files('dist').filter(f => f.endsWith('.html'));
let checked = 0;
for (const file of pages) {
  const html = fs.readFileSync(file, 'utf8');
  assert.match(html, /<html lang="ja">/);
  assert.match(html, /<h1[ >]/);
  assert.match(html, /<meta name="description"/);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
  assert.equal(ids.length, new Set(ids).size, `${file}: duplicate IDs`);
  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const href = match[1].replaceAll('&amp;', '&');
    if (/^(?:https?:|mailto:|data:)/.test(href)) continue;
    const [pathname, fragment] = href.split('#');
    let target = file;
    if (pathname) {
      assert.ok(pathname.startsWith(`${base}/`), `${file}: base path missing in ${href}`);
      const local = pathname.slice(base.length + 1);
      target = `dist/${local}${!local || local.endsWith('/') ? 'index.html' : ''}`;
    }
    assert.ok(fs.existsSync(target), `${file}: missing ${href}`);
    if (fragment) {
      const targetHtml = fs.readFileSync(target, 'utf8');
      assert.ok(targetHtml.includes(`id="${decodeURIComponent(fragment)}"`), `${file}: missing anchor ${href}`);
    }
    checked++;
  }
}
assert.ok(fs.readFileSync('dist/feed.xml', 'utf8').includes('<rss version="2.0">'));
assert.ok(fs.readFileSync('dist/sitemap.xml', 'utf8').includes(`${config.origin}${base}/`));
console.log(`Checked ${pages.length} pages and ${checked} internal links/assets/anchors.`);
