# Deployment

The site is served by Cloudflare Workers from this repository's `main` branch: the project builds
with `npm run cf:build` (`astro build`, then `scripts/check-build.mjs`), deploys with
`npx wrangler deploy`, and `wrangler.jsonc` serves `dist` with the headers in `public/_headers`.
`loadtable.osvauld.com` is its custom domain. A pull request gets a preview build.

## Owner confirmations before publishing

1. **Source link.** The install page tells people to `git clone https://github.com/osvauld/loadtable`.
   Done 2026-10-29: `osvauld/task-manager` is renamed to `osvauld/loadtable` and public (old URLs
   redirect).
2. **A release to install.** The installer reads `https://dl.loadtable.osvauld.com/latest` and
   downloads that release from the same host. v0.1.0 is there since 2026-10-29; a site change that
   names a newer version waits for that release.
3. **Push.** Committing locally does not authorize a push, a DNS change or a deploy.

## Validation

```sh
npm ci
npm run cf:build
sh -n dist/install.sh
```

Then check every page at 390 px and 1440 px wide, light and dark, for overflow and console errors.
