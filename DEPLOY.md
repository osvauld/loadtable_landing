# Deployment

## Owner confirmations before publishing

1. **Source link.** The install page tells people to `git clone https://github.com/osvauld/loadtable`.
   The code is in `osvauld/task-manager` today. Rename or create the public repository first, or
   change the install page.
2. **The rename has shipped.** The docs use `loadtable`/`loadtabled`, `~/.local/state/loadtable`,
   `.loadtable/run-policy.toml` and `LOADTABLE_WHO`. Publish after that build is released, or the
   commands on the site will not exist.
3. **Hosting.** Create the Netlify site from this repository's `main` branch (build settings come
   from `netlify.toml`), and point `loadtable.osvauld.com` at it.
4. **Push.** Committing locally does not authorize a push, a DNS change or a deploy.

## Validation

```sh
npm ci
npm run build
npm run check
```

Then check every page at 390 px and 1440 px wide, light and dark, for overflow and console errors.
