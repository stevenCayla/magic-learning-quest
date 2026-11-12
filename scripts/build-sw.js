import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
async function walk(dir) {
  const items = await readdir(dir, { withFileTypes: true });
  return (
    await Promise.all(
      items.map((d) => (d.isDirectory() ? walk(`${dir}/${d.name}`) : `${dir}/${d.name}`)),
    )
  ).flat();
}
const files = (await walk('dist')).filter((f) => !f.endsWith('/sw.js'));
const hash = createHash('sha256');
for (const file of files) hash.update(await readFile(file));
const version = hash.digest('hex').slice(0, 12);
const base = '/magic-learning-quest/';
const urls = [base, ...files.map((f) => base + f.slice(5))];
await writeFile(
  'dist/sw.js',
  `/* Generated from build content. Do not edit. */
const CACHE = 'astrea-${version}';
const BASE = ${JSON.stringify(base)};
const ASSETS = ${JSON.stringify(urls)};
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('astrea-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return;
  if (event.request.mode === 'navigate') {
    event.respondWith(fetch(event.request).then(response => response.ok ? response : caches.match(BASE, { ignoreVary: true })).catch(() => caches.match(BASE, { ignoreVary: true })));
  } else {
    event.respondWith(caches.match(event.request, { ignoreVary: true }).then(cached => cached || fetch(event.request)));
  }
});
`,
);
console.log(`Offline shell: ${urls.length} assets, cache astrea-${version}`);
