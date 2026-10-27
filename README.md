# loadtable-site

The website and documentation of LoadTable, at https://loadtable.osvauld.com.
Astro, static output, deployed to Cloudflare Workers from `main` (see `DEPLOY.md`).

```sh
npm ci
npm run dev      # http://localhost:4321
npm run build && npm run check
```

- `src/pages/index.astro`: the home page. Its board is illustrative, and says so.
- `src/content/docs/*.md`: one page per file, ordered by `order` in the frontmatter.
- `public/favicon.svg`: the logo, a tipper truck's bucket carrying a load of jobs.

Every page carries a strict content policy: no inline styles or scripts, fonts served from this
site. `npm run check` fails the build if a page breaks it or still names the old `tasks2` command.

The docs describe the CLI as `loadtable`/`loadtabled`. Check them against `loadtable --help`
whenever the CLI changes.
