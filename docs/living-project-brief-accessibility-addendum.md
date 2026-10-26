# gestalt.fyi — Living project brief: accessibility addendum

**Date:** 26 October 2026
**Scope:** Field Guide article template and shared Astro pages
**Status:** Source-code audit completed; remediation batch 1 committed, runtime verification outstanding.
**Applies to:** Development branch `astro-proof-of-concept`. No production deployment.

## Decision

Treat Accessibility as a **template proof of concept**, not an article-by-article editorial review. Continue design and implementation that does not depend on relationship taxonomy. **Defer relationship navigation and implementation** until the separate Field Guide Relationships taxonomy, migration and reconciliation are complete.

## Audit basis and limitations

Reviewed `src/layouts/Layout.astro`, `src/pages/index.astro`, `src/pages/field-guide/index.astro`, `src/pages/field-guide/[slug].astro`, `src/components/notion-rich-text.astro`, and shared/article CSS. The target is WCAG 2.2 AA. This is a code review, **not** a browser-based axe, keyboard, screen-reader, contrast-state, or 400% zoom audit. No conformance claim is made.

## Template accessibility backlog

| Priority | Issue | Planned acceptance criterion | Status |
| --- | --- | --- | --- |
| High | Shared layout hardcoded the same page title for every page | Each route has a meaningful, unique document title and description | **Implemented in batch 1; build/runtime unverified** |
| High | Notion renderer silently drops unsupported blocks, including lists, figures, quotations and callouts | Supported blocks render with semantic HTML and meaningful alternative text where needed; unsupported blocks produce an actionable build-time warning/error rather than silent omission | **Open** |
| Medium | Table of contents flattened H2/H3 structure | H3 links nested under their H2 parent in the list DOM, with predictable numbering and keyboard links | **Implemented in batch 1; browser verification outstanding** |
| Medium | Rich-text annotations lost around inline citations | Preserve emphasis and links in text surrounding citations | **Open** |
| Medium | Contact disclosure focus and announcement behaviour | Keyboard and screen-reader test the disclosure, focus order and status feedback; change only if test reveals a problem | **Needs verification** |
| Medium | Small text, reference legibility, mobile reflow | Check rendered font sizes, 200–400% zoom, 320 CSS-pixel viewport and link target sizes | **Open** |
| Medium | Keyboard bypass navigation | Visible-on-focus skip link targets the main landmark on each route | **Implemented in batch 1; keyboard verification outstanding** |
| Verify | Colour contrast and interaction states | Measure all rendered text, hover, focus and non-text UI contrast, not just token pairs | **Not tested** |
| Verify | Citation anchors, focus and motion | Test keyboard navigation, destination visibility and reduced-motion preferences | **Not tested** |
| Verify | Automated and assistive technology checks | Run axe-core and manual keyboard/screen-reader checks on homepage, index and pilot article | **Not tested** |

## Remediation batch 1 — committed to development branch

- Shared `Layout.astro`: optional per-page `title` and `description` props; keyboard skip link.
- Homepage, Field Guide index and article template: unique title/description props and `id="main-content"` targets.
- Field Guide article: grouped TOC H3 links into nested ordered lists under their parent H2 link.
- Shared/article CSS: skip-link focus treatment and nested TOC presentation.

**Verification:** GitHub commits succeeded. Astro build and browser-based behaviour have **not** yet been run or verified. Keep batch 1 in development until validated.

## Next actions

1. Pull development branch into Codespace, run `npm run build` from `astro-site`, and fix any errors.
2. Visually and manually test the homepage and Accessibility article: skip link, nested TOC, citation links, keyboard order, zoom/reflow.
3. Run automated accessibility testing and log verified findings.
4. Implement semantic Notion block support and fail visibly for unsupported editorial content.
5. Refine citation rich-text formatting and focus behaviour.
6. Preserve the production publication-status gate as a separate **required predeployment safeguard**.
7. Integrate these notes into the next canonical living project brief revision (v0.3 or later), reconciling with the taxonomy work tracked in the other conversation.

**Explicitly excluded:** Relationship database ingestion, relationship navigation, legacy property cutover, and taxonomy migration.
