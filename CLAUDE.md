# Portfolio (justinlawes.com)

**This is the source of truth for https://justinlawes.com.**

- Remote: `github.com/justin-lawes/portfolio` (main branch)
- Deploys via GitHub Actions (`.github/workflows/deploy.yml`) to GitHub Pages with `CNAME: justinlawes.com`
- Build: Eleventy 3 — `npm ci && npx @11ty/eleventy`
- Dev: `npm run dev` (serves on :8080)
- Pushing to `main` deploys live. Build and check locally first.

## How the site is wired

- **Listing order.** `src/_data/sectionOrder.json` holds the project order for
  the Featured, Work, Play and Music pages (`featured`, `work`, `play`,
  `musicAlbums`, `musicScores`). Reorder or add projects there. The project
  page's prev/next arrows use the same lists when a visitor arrives directly.
- **Videos.** Project front matter keeps Vimeo IDs (`video`, `extraVideos`,
  section `videos`). The `videoSrc` filter in `.eleventy.js` maps each one to
  its FrameRate embed through `src/_data/framerate.json` (Vimeo ID to
  FrameRate UUID). An ID missing from that file still embeds from Vimeo; Blend
  and Detached do this on purpose because they live on other people's Vimeo
  accounts. Square or portrait players need `videoAspectRatio` (and usually
  `videoMaxWidth`), or FrameRate letterboxes them.
- **CSS.** Edit `src/css/style.css` only. The build writes
  `css/style.min.css` from it (clean-css, `eleventy.after` hook). There is no
  committed min file.
- **Images.** `src/images` is passed through whole; pages use the optimised
  `/img/` copies from the image transform. After each build, an
  `eleventy.after` hook deletes any file under the output `images/` that no
  page, stylesheet or script references. Link previews use 1200px JPEG copies
  in `/img/og/` made by the `ogImage` filter.
- **Password gate.** `passwordHash` in front matter shows a client-side gate
  and adds `noindex`/drops the page from the sitemap. It only hides content on
  screen; the page source still contains everything.

## Pitfalls

- **Never name a file in `src/_data/` after a front-matter field.** Eleventy
  deep-merges global data into page data, so a `sections.json` once replaced
  every project's `sections` array and hid all project grids on the live site
  (fixed in 4685f61). Check names against the keys used in `src/projects/*.md`.
- **Check whole pages, not just the change.** Before pushing template or data
  changes, compare a full build against the previous one (section headings,
  videos, iframes, image counts and text per page).
- Build with `--output=<temp dir>` to test without touching `_site`; the hooks
  use `eleventyConfig.directories.output`, so they follow the override.

## History note

There used to be a second copy of this site living inside the parent `ClaudeCode/` repo (which pushes to `justin-lawes/ae-scripts`). That copy was deployed to the unused `justin-lawes.github.io/ae-scripts/` mirror and caused divergent edits between Mac and PC. As of 2026-04-21 the stale copy and its deploy workflow were removed, and `/portfolio/` is gitignored from the parent repo so this standalone clone can live here without being reabsorbed. Always edit here.
