import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://loadtable.osvauld.com',
  output: 'static',
  // The page policy forbids inline styles, including Astro's small-CSS optimization.
  build: { inlineStylesheets: 'never' },
  // Shiki writes inline style attributes on code blocks, which the policy would also block.
  markdown: { syntaxHighlight: false },
  // Small scripts must also stay external: script-src 'self' does not allow inline JS.
  vite: { build: { assetsInlineLimit: 0 } },
});
