# gestalt.fyi — Living Project Brief

**Version:** 0.4 (consolidation baseline)
**Updated:** 27 October 2026
**Status:** Active development
**Canonical path:** `docs/gestalt-fyi-living-project-brief.md` on `astro-proof-of-concept` until reviewed and merged.
**Authority:** This file is the proposed single maintained project brief. Older uploads, Library copies and chat drafts are historical snapshots, not independently authoritative. This consolidation preserves verified current decisions and links to detailed work; it is not a line-by-line reconciliation of every historical draft.

## Purpose and principles

gestalt.fyi is a personal website and evolving, evidence-informed UX Field Guide spanning product design, psychology, accessibility, ethics and technology. Its organising perspective is **People before technology. Technology for people.** Prioritise accessible editorial quality, simple maintainable architecture, low cost and incremental verified progress. Follow the approved gestalt.fyi Editorial Voice Guide for editorial content.

## Architecture and publishing

- Domain: `gestalt.fyi`; GitHub repository: `rgb-hermit/gestalt-fyi`; hosting: GitHub Pages.
- Production branch: `main`. Development branch: `astro-proof-of-concept`; development work must not be confused with production deployment.
- Astro application: `astro-site/`. Development in GitHub Codespaces.
- Agreed pipeline: **Notion editorial source → read-only Astro build-time retrieval → static GitHub Pages**.
- Manual publishing is preferred initially; do not automate publishing until there is a demonstrated need.
- **Required before deployment:** enforce `Publication status = Published` at build time, configure build secrets safely and verify unpublished drafts cannot leak into generated pages. These safeguards are not yet confirmed complete.

## Current implementation — verified or committed

- Live website and domain/HTTPS were previously verified; the current Astro development branch is not thereby production-ready.
- Notion read-only API access from Codespaces verified; Accessibility pilot page retrieval returned 44 blocks.
- Development article template retrieves Accessibility blocks, renders headings/paragraphs and rich text, extracts references, and supports superscript citation links that jump to references. User visually confirmed article and citation links.
- CSS for callouts, images and captions exists; **Notion rendering for these block types is not yet implemented**. Unsupported blocks may currently be silently omitted.
- Development cleanup committed and user confirmed preview looked good.
- Accessibility audit batch 1 committed on development branch: descriptive route titles, skip-navigation link and semantically nested TOC. **Build and browser verification still outstanding.** See [accessibility audit addendum](./living-project-brief-accessibility-addendum.md).

## Field Guide and relationship taxonomy

- The Field Guide Notion database is the editorial source of truth for **397 concepts**; the three-entry pilot is not a production release.
- A separate **Field Guide Relationships** database is the agreed destination for structured relationships; legacy concept properties must remain intact until reconciliation, backup, verified ingestion and safe cutover.
- **Latest reported relationship direction (26 October):** simplified semantic categories **Hierarchical, Contrasting, Associative**; hierarchical links parent → child; associative and contrasting links bidirectional conceptually with one record per pair. Earlier detailed relevance/perspective/rationale/provenance requirements may be superseded; verify against the active taxonomy conversation before any schema changes.
- Relationship migration counts differ between snapshots (73 verified in an earlier status, later reports of 509 retained records and partial cleanup). **Do not treat any of these as a current verified completion count without querying Notion.**
- **Explicit hold:** no relationship UI, Astro ingestion or navigation implementation until the taxonomy/migration work is complete and approved. Do not delete legacy properties.
- The original pilot requirement for relationship navigation is deferred, not a blocker to article-template work.

## Design system and template work

- Preserve the established deep-green/ivory/lavender editorial visual direction, typographic hierarchy and reusable article layout.
- Accessibility is a **template fixture**, not a request for entry-by-entry editorial polishing.
- Prioritise semantic content components, headings and navigation, responsive layout, keyboard/focus usability, text contrast and readable references.
- Keep source of truth in Notion; avoid duplicating editorial content in Astro.

## Current workstreams and next actions

1. **Verify batch 1:** pull development branch, run `npm run build` in `astro-site`, check page titles, skip links, nested TOC and citation navigation on keyboard and mobile.
2. **Complete content rendering:** semantic Notion lists, quotations, callouts, images/captions; surface unsupported blocks instead of silently dropping content.
3. **Audit accessibility:** axe and manual keyboard, screen-reader, contrast, 320px reflow and 200–400% zoom.
4. **Harden publication:** published-only filtering, secrets and reproducible Astro → GitHub Pages build/deploy, before any pilot publication.
5. **Three-entry pilot:** validate diverse content using the shared template, excluding relationship-specific functionality.
6. **Separately:** finish relationship taxonomy, migration and reconciliation in its own workstream.

## Collaboration and document governance

- **One canonical document:** `docs/gestalt-fyi-living-project-brief.md`. Put version/date in the document, not filename. Do not create alternative briefs, new versioned filenames or parallel addenda for routine updates.
- Make small direct edits to this file, on the development branch; review and merge via normal GitHub workflow.
- Record changes under the change log below, with evidence and status: **verified**, **committed but unverified**, **planned**, or **blocked**.
- For large independent audits, retain a dedicated linked working document; summarise its implications here.
- Treat project attachments and Library files as snapshots; do not silently overwrite them or assume they automatically synchronise with GitHub.
- Preserve decisions unless explicitly revisited; never report a tool action as complete without confirmation.
- Keep taxonomy/relationship work separate from website template implementation until approved.

## Change log

| Date | Change | Verification |
| --- | --- | --- |
| 21–25 Oct 2026 | Earlier v0.1–v0.3 brief snapshots and evolving project architecture | Historical; overlapping copies exist |
| 25–26 Oct 2026 | Notion article rendering, references, citations and cleanup | Code committed; article preview user-verified |
| 26 Oct 2026 | Accessibility source audit and first remediation batch | Committed; build/browser testing pending |
| 27 Oct 2026 | Established one GitHub canonical brief and explicit document governance; deferred relationship implementation | Canonical baseline committed; reconciliation with all historical drafts remains open |

## Historical reconciliation note

Prior versions and similarly named Library/Project attachments remain available as historical records. This baseline incorporates major known decisions, but some documents in other chats may contain later unmerged taxonomy details. Before treating this baseline as fully reconciled, compare those drafts and import any non-conflicting decisions with a dated change-log entry. Do not infer that deleting old copies is safe.
