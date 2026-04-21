# Portfolio (justinlawes.com)

**This is the source of truth for https://justinlawes.com.**

- Remote: `github.com/justin-lawes/portfolio` (main branch)
- Deploys via GitHub Actions (`.github/workflows/deploy.yml`) to GitHub Pages with `CNAME: justinlawes.com`
- Build: Eleventy 3 — `npm ci && npx @11ty/eleventy`
- Dev: `npm run dev` (serves on :8080)

## History note

There used to be a second copy of this site living inside the parent `ClaudeCode/` repo (which pushes to `justin-lawes/ae-scripts`). That copy was deployed to the unused `justin-lawes.github.io/ae-scripts/` mirror and caused divergent edits between Mac and PC. As of 2026-04-21 the stale copy and its deploy workflow were removed, and `/portfolio/` is gitignored from the parent repo so this standalone clone can live here without being reabsorbed. Always edit here.
