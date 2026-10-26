# gestalt.fyi — Living Project Brief

**Version:** 0.6
**Updated:** 27 October 2026
**Status:** Active development
**Canonical path:** `docs/gestalt-fyi-living-project-brief.md` on `astro-proof-of-concept` until reviewed and merged.
**Authority:** This is the single maintained project brief for architecture, decisions, progress and next actions. Older uploads, Library copies and chat drafts are historical snapshots, not independently authoritative. Detailed editorial conventions remain in Notion; their current rules inform this brief. Historical materials have not all been line-by-line reconciled.

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
- The separate **Field Guide Relationships** database is the agreed structured mapping register. Original Field Guide concept records and legacy relationship properties must remain intact until complete reconciliation, backup, approved migration, verified website ingestion and explicit cutover.
- **Approved taxonomy:** exactly three semantic categories — **Hierarchical**, **Contrasting**, **Associative**. Hierarchical records are directional **parent → child**, further classified as **Subtype** or **Component**. Associative and Contrasting records are **bidirectional in meaning** and stored as **one record per unordered concept pair**; a future publishing layer will derive the reverse view. Do not create reverse duplicate records.
- **Editorial quality threshold:** map a relationship only when it is clear, accurate and meaningfully useful to readers. Shared terminology or broad thematic proximity is not sufficient. **No relationship is preferable to an incorrect or weak relationship.** Review and remove weak inherited links without deleting the concept entries. Do not artificially maximise link count.
- **Minimum working classification:** linked source and target, semantic type, and hierarchy subtype/component where applicable, with workflow statuses. Relevance, relevance perspective, rationale and provenance are no longer required to map a pair; historical values may remain in Notion and must not be bulk-deleted without approval.
- **Approval versus verification:** assistant review, user editorial approval (sometimes at batch level), and technical Notion verification are distinct. The Notion `Migration status = Verified` field does not certify individual user review of every row or complete mapping coverage of all 397 concepts.
- The detailed [Relationships — editorial conventions](https://app.notion.com/p/404bf19d05418135bbbdf7c7f7267b7e) page was updated on 27 October with current governing rules, followed by historical milestones that may describe superseded workflows. Resolve contradictions in favour of the current rules; do not discard historical records silently.

### Relationship migration status (27 October 2026)

**Verified completed:** Reviewed 200 original relationship records in the structured register, consolidating 35 redundant reciprocal records and removing one weak connection. Classification corrections were applied and checked in Notion. Legacy Field Guide relation properties were not changed. This is partial register review, not full coverage of 397 concepts; some records still show `Migrated` rather than `Verified`.

**Approved, blocked:** The next 50 records were reviewed and their cleanup approved: consolidate 10 reciprocal pairs and reject two weak associations. Notion deletion attempts were blocked, so this cleanup remains **unexecuted and unverified**. Preserve the existing **Design Systems → Design Tokens** hierarchical record and remove only its redundant reversed associative record. The exact record decisions are in Notion/chat history.

**Outstanding:** Complete and verify approved cleanup; review remaining register records; audit all concepts for missing meaningful relationships; reconcile legacy assertions and confirm final counts; secure final taxonomy/migration approval. Do not infer completeness from batch approval or technical status fields.

- **Implementation hold:** no relationship-specific UI, Astro ingestion or navigation until taxonomy and migration are complete and approved. Do not delete legacy properties or modify production without approval.
- Relationship navigation remains deferred and does not block unrelated article-template work.

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
6. **Separately — relationship workstream:** complete approved Batch 5 Notion cleanup and verify it; resume subsequent batches; perform missing-connection coverage and legacy reconciliation; seek final taxonomy/migration approval. Relationship UI and Astro ingestion remain on hold.

## Collaboration and document governance

- **One canonical document:** `docs/gestalt-fyi-living-project-brief.md`. Put version/date in the document, not filename. Do not create alternative briefs, new versioned filenames or parallel addenda for routine updates.
- Make proportionate, direct edits to this file on the development branch; review and merge via normal GitHub workflow. **Document decisions and outcomes, not every step.**
- Update for significant architectural/editorial decisions, rationale for changes, consequential discoveries or blockers, milestone outcomes, verified current state, and next meaningful actions. Distinguish **verified**, **committed but unverified**, **planned**, and **blocked**. Routine batches, tool calls, corrections, and record-level checks do not each warrant an entry.
- Keep existing detailed operational history in Notion or GitHub history rather than duplicating it or creating new routine addenda. Summarise migration progress; once complete, replace temporary progress notes with the final outcome while preserving unresolved risks and decisions needed to resume work.
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
| 27 Oct 2026 | Reconciled relationship taxonomy, editorial quality threshold, partial migration state and blocked cleanup | Source decisions reviewed; final migration reconciliation remains open |
| 27 Oct 2026 | Adopted proportionate, decision-and-outcome-focused documentation; condensed temporary relationship progress without losing the cleanup blocker | Documentation policy agreed; brief updated on development branch |

## Historical reconciliation note

Prior versions and similarly named Library/Project attachments remain available as historical records. The current relationship rules and known Batches 1–5 decisions have now been reconciled into this file, but this is not a line-by-line audit of every historical draft. Older Notion editorial-conventions milestones describe earlier directed/relevance-heavy methods; its dated current governing rules supersede those workflows. Do not infer that deleting old copies is safe.
