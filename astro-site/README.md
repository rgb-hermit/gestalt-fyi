# gestalt.fyi website

This directory contains the Astro application for [gestalt.fyi](https://gestalt.fyi/), including the homepage and UX Field Guide. The repository root also retains an earlier static HTML/CSS version of the site; the current GitHub Pages deployment builds this Astro application.

## Structure

- `src/pages/index.astro` — homepage
- `src/pages/field-guide/index.astro` — Field Guide landing page (currently a placeholder)
- `src/pages/field-guide/[slug].astro` — published Field Guide article template
- `src/components/` — shared site components
- `src/components/field-guide/` — Notion article-rendering components
- `src/layouts/Layout.astro` — shared document layout
- `src/lib/notion.ts` — read-only Notion retrieval and publication validation
- `public/styles.css` — site-wide styles and design tokens
- `public/field-guide.css` — Field Guide article styles
- `test-notion-discovery.mjs` — Notion discovery and publication validation checks

The `src/data/` directory contains older local data. It is retained pending a separate dependency review; Notion is the authoritative source for published Field Guide content.

## Development

Use Node.js 24.22.1 (see `.nvmrc`). From `astro-site/`:

```sh
npm ci
npm run dev
npm run build
npm run preview
```

Notion-backed builds require `NOTION_API_TOKEN` in the environment. Keep credentials out of Git. The read-only publishing integration discovers eligible Field Guide entries at build time, validates their metadata and generates static article pages. To run the separate discovery and validation script:

```sh
node test-notion-discovery.mjs
```

## Deployment

`.github/workflows/deploy-astro.yml` installs dependencies and builds `astro-site/` on pull requests and configured branch pushes. Only qualifying builds on `main` upload and deploy to GitHub Pages. The `astro-site/public/CNAME` file preserves the custom domain. The workflow uses the repository's `NOTION_API_TOKEN` secret; never place it in source code.

A successful build does not independently verify published pages or accessibility. Check the relevant pages and interactions before approving a production merge.

## Project guidance

The canonical Living Project Brief lives in the private `gestalt-fyi-internal` repository. The approved Design & Development Working Guide and Editorial Voice Guide live in Notion. Refer to those authoritative sources for current decisions and conventions rather than duplicating them here.
