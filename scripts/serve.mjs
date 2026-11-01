import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const { basePath } = JSON.parse(fs.readFileSync('site/config.json', 'utf8'));
const base = (process.env.SITE_BASE_PATH ?? basePath).replace(/\/$/, '');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.xml': 'application/xml; charset=utf-8' };
http.createServer((req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400).end(); return; }
  if (pathname === '/' && base) { res.writeHead(302, { Location: `${base}/` }).end(); return; }
  if (!pathname.startsWith(`${base}/`)) { res.writeHead(404).end('Not found'); return; }
  const relative = pathname.slice(base.length + 1);
  const target = path.resolve('dist', relative, relative.endsWith('/') || !relative ? 'index.html' : '');
  if (!target.startsWith(`${path.resolve('dist')}${path.sep}`)) { res.writeHead(403).end(); return; }
  if (!fs.existsSync(target) || !fs.statSync(target).isFile()) {
    res.writeHead(404, { 'Content-Type': types['.html'] }).end(fs.readFileSync('dist/404.html')); return;
  }
  res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream' });
  fs.createReadStream(target).pipe(res);
}).listen(4173, '127.0.0.1', () => console.log(`Local: http://127.0.0.1:4173${base}/`));
