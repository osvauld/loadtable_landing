// Checks the built site: every page carries the strict policy, no inline styles or scripts, and the logo.
import assert from 'node:assert/strict';
import { readFile, readdir, access } from 'node:fs/promises';

const dist = process.argv[2] ?? 'dist';
const docRoutes = (await readdir('src/content/docs')).filter(f => f.endsWith('.md'))
  .map(f => f === 'index.md' ? 'docs/' : `docs/${f.slice(0, -3)}/`);
for (const route of ['', ...docRoutes]) {
  const page = route || '/';
  const html = await readFile(`${dist}/${route}index.html`, 'utf8');
  assert(!/<style(?:\s|>)/i.test(html), `${page}: inline CSS would be blocked by the page policy`);
  assert(!/\sstyle\s*=/i.test(html), `${page}: inline style attribute blocked by the page policy`);
  assert(/<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'self'; style-src 'self';/.test(html), `${page}: missing the strict page policy`);
  const scripts = [...html.matchAll(/<script\b[^>]*>/gi)].map(([tag]) => tag);
  assert(scripts.every(tag => {
    const src = tag.match(/\bsrc="([^"]+)"/)?.[1];
    return src === '/theme.js' || /^\/_astro\/[a-zA-Z0-9_.-]+\.js$/.test(src ?? '');
  }), `${page}: inline or foreign script ${scripts}`);
  assert(html.includes('src="/favicon.svg"'), `${page}: missing logo`);
  assert(!/tasks2/.test(html), `${page}: still names the old tasks2 command`);
  if (docRoutes.includes(route)) assert(html.includes('LoadTable is early software'), `${page}: missing status note`);
  const sheets = [...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/gi)].map(([tag]) => tag.match(/href="([^"]+)"/)?.[1]);
  assert(sheets.length > 0, `${page}: missing external stylesheet`);
  for (const href of sheets) assert(href?.startsWith('/_astro/') && href.endsWith('.css'), `${page}: unexpected CSS URL ${href}`);
}
for (const f of ['fonts/figtree_variable.ttf', 'fonts/plexmono_regular.ttf', 'favicon.svg', 'logo.svg', 'theme.js']) await access(`${dist}/${f}`);
const installer = await readFile(`${dist}/install.sh`, 'utf8');
assert(installer.startsWith('#!/bin/sh\n') && installer.trimEnd().endsWith('main "$@"'), 'install.sh: missing or truncated');
assert(installer.includes('REPO="https://dl.loadtable.osvauld.com"'), 'install.sh: wrong release location');
if (/goatcounter|google-analytics|googletagmanager|plausible\.io|posthog/i.test(await readFile(`${dist}/index.html`, 'utf8'))) throw new Error('analytics reference in the site');
// Hashed assets are cached for good, and Chromium prefetches the next page from the rules file.
const headers = await readFile(`${dist}/_headers`, 'utf8');
for (const rule of ['/_astro/*']) assert(headers.includes(`${rule}\n  Cache-Control: public, max-age=31536000, immutable`), `_headers: ${rule} is not cached as immutable`);
assert(headers.includes('Speculation-Rules: "/speculation-rules.json"'), '_headers: missing the Speculation-Rules header');
assert(JSON.parse(await readFile(`${dist}/speculation-rules.json`, 'utf8')).prefetch?.length > 0, 'speculation-rules.json: no prefetch rule');
console.log(`${docRoutes.length + 1} pages: strict policy, external CSS and scripts, self-hosted fonts, no tasks2 left.`);
