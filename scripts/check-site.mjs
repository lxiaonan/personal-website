import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const site = new URL(process.env.DEPLOY_SITE_URL || 'https://yunan.aiutil.cloud');
const base = (process.env.DEPLOY_BASE_PATH || '/').replace(/\/$/, '');
const pages = new Map();
const decode = (value) => value.replace(/&#(x[\da-f]+|\d+);|&(amp|quot|apos|lt|gt);/gi, (_, number, name) =>
  number ? String.fromCodePoint(number[0].toLowerCase() === 'x' ? parseInt(number.slice(1), 16) : Number(number))
    : ({ amp: '&', quot: '"', apos: "'", lt: '<', gt: '>' })[name.toLowerCase()]);

async function collect(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) await collect(file);
    else if (entry.name.endsWith('.html')) pages.set(file, await readFile(file, 'utf8'));
  }
}
await collect(root);
assert.ok(pages.size > 0, 'Run npm run build before test:site');

let links = 0;
const canonicalURLs = new Set();
for (const [file, html] of pages) {
  const relative = path.relative(root, file).split(path.sep).join('/');
  const pathname = '/' + relative.replace(/index\.html$/, '');
  const pageURL = new URL(base + pathname, site);
  const canonicalTag = html.match(/<link\b[^>]*rel="canonical"[^>]*>/)?.[0];
  const canonical = decode(canonicalTag?.match(/href="([^"]+)"/)?.[1] ?? '');
  // Astro's 404 canonical is /404, while the generated file is /404.html.
  if (relative !== '404.html') assert.equal(canonical, pageURL.href, `Wrong canonical: ${relative}`);
  assert.ok(canonical && !canonicalURLs.has(canonical), `Missing or duplicate canonical: ${relative}`);
  canonicalURLs.add(canonical);
  assert.doesNotMatch(html, /hello \[at\] your-domain\.com|linux\.do\/u\/yourname/, `Placeholder contact: ${relative}`);

  for (const match of html.matchAll(/\bhref="([^"]*)"/g)) {
    const href = decode(match[1]);
    assert.ok(href, `Empty href: ${relative}`);
    const target = new URL(href, pageURL);
    if (target.origin !== site.origin || !['http:', 'https:'].includes(target.protocol)) continue;
    if (relative === '404.html' && target.href === canonical) continue;
    assert.ok(!base || target.pathname.startsWith(base + '/'), `Link escapes base path: ${relative} -> ${href}`);
    let destination = path.join(root, decodeURIComponent(target.pathname.slice(base.length)));
    const info = await stat(destination).catch(() => null);
    assert.ok(info, `Missing target: ${relative} -> ${href}`);
    if (info.isDirectory()) destination = path.join(destination, 'index.html');
    assert.ok(await stat(destination).catch(() => null), `Missing index: ${relative} -> ${href}`);
    if (target.hash && pages.has(destination)) {
      const ids = [...pages.get(destination).matchAll(/\bid="([^"]+)"/g)].map((item) => decode(item[1]));
      assert.ok(ids.includes(decodeURIComponent(target.hash.slice(1))), `Missing anchor: ${relative} -> ${href}`);
    }
    links++;
  }
}

const entries = JSON.parse(await readFile(path.join(root, 'search.json'), 'utf8'));
const searchHTML = await readFile(path.join(root, 'search/index.html'), 'utf8');
assert.equal((searchHTML.match(/<li\b[^>]*\bdata-search-entry(?:\s|=|>)/g) ?? []).length, entries.length, 'Search page/index count mismatch');
assert.equal(new Set(entries.map((entry) => entry.url)).size, entries.length, 'Duplicate search URLs');
for (const entry of entries) {
  const target = new URL(entry.url, site);
  assert.ok(!base || target.pathname.startsWith(base + '/'), `Search escapes base path: ${entry.url}`);
  assert.ok(await stat(path.join(root, target.pathname.slice(base.length), 'index.html')).catch(() => null), `Missing search target: ${entry.url}`);
}
console.log(`Checked ${pages.size} HTML pages, ${links} internal links/anchors and ${entries.length} search entries.`);
