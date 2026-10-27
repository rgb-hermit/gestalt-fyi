# gestalt.fyi — Living Project Brief

**Version:** 0.8
**Updated:** 28 October 2026
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

### Relationship migration and coverage status (27 October 2026)

**Verified register reconciliation:** The original 509 relationship records were reviewed through 10 alphabetical batches. With user-approved consolidation of 105 reciprocal duplicates and removal of 12 weak records, **392 live relationship records** remained at that reconciliation milestone (subsequently 435; see 28 October check below). Notion confirms the expected count, no duplicate names or reciprocal pairs, valid semantic/hierarchy combinations, linked source and target concepts, and **392/392 records then marked Approved and technically Verified**. This structural reconciliation does not independently prove the historical disposition of each original row against a frozen baseline, nor does technical verification replace editorial coverage review. Legacy Field Guide relation properties remain untouched.

**Register integrity rechecked (28 October 2026):** Live Notion contains **435 relationships**: 392 created on 25–26 October and 43 created on 27 October. All 435 have unique record IDs and unique unordered source–target pairs (no reverse duplicates), exactly one valid Field Guide source and target among 397 concepts, no self-links, valid semantic/hierarchy fields, and Approved / Verified statuses. Breakdown: 399 Associative, 31 Hierarchical, 5 Contrasting. The 43 later additions explain the numerical change from the previous baseline; their individual or batch-level user-approval provenance has **not** been independently established by this technical check, so approval history remains to be reconciled before treating them as editorially settled. No Notion records were changed.\n\n**Coverage audit underway:** All **397 concepts** were enumerated against the then-392-record register: **121 had no relationship**, **78 had one**, and **198 had two or more**. These coverage counts are historical and require recalculation against 435 records. These counts are diagnostic, **not coverage targets**. A concept may correctly remain unconnected; propose only obvious, coherent, reader-useful links. The first candidate batch was drafted but **not approved or written** and must be re-reviewed against this stricter threshold. Keep editorial approval separate from technical verification.

**Outstanding:** Review concept coverage without forced links; reconcile legacy assertions and any migration exceptions; obtain final taxonomy/migration approval before relationship-specific website integration or legacy-property cutover.

- **Implementation hold:** no relationship-specific UI, Astro ingestion or navigation until taxonomy and migration are complete and approved. Do not delete legacy properties or modify production without approval.
- Relationship navigation remains deferred and does not block unrelated article-template work.

## Article component fixture

- Created [Article Component Test](https://app.notion.com/p/406bf19d0541819b8293ccfbc70ce5a9) in the existing Field Guide Notion database as an **Unpublished**, **Launch priority: Exclude** development fixture (`article-component-test`). It exercises headings, rich text, lists, quotations, callouts, image/caption, code, table and references for Notion → Astro rendering and visual styling. Creation is verified; Astro rendering is not yet verified.
- This record is **not an editorial concept**: exclude its page ID from concept counts, relationship mapping/coverage audits, public indexes and the three-real-article pilot. Do not publish it. Before deployment, verify published-only filtering; a development-only route may render the fixture explicitly.

## Design system and template work

- Preserve the established deep-green/ivory/lavender editorial visual direction, typographic hierarchy and reusable article layout.
- Accessibility is a **template fixture**, not a request for entry-by-entry editorial polishing.
- Prioritise semantic content components, headings and navigation, responsive layout, keyboard/focus usability, text contrast and readable references.
- Keep source of truth in Notion; avoid duplicating editorial content in Astro.

## Current workstreams and next actions

1. **Verify batch 1:** pull development branch, run `npm run build` in `astro-site`, check page titles, skip links, nested TOC and citation navigation on keyboard and mobile.
2. **Use the Notion component fixture to complete content rendering:** semantic Notion lists, quotations, callouts, images/captions; surface unsupported blocks instead of silently dropping content.
3. **Audit accessibility:** axe and manual keyboard, screen-reader, contrast, 320px reflow and 200–400% zoom.
4. **Harden publication:** published-only filtering, secrets and reproducible Astro → GitHub Pages build/deploy, before any pilot publication.
5. **Three-entry pilot:** validate diverse content using the shared template, excluding relationship-specific functionality.
6. **Separately — relationship workstream:** review all 397 concepts for meaningful missing connections (including valid zero-link outcomes); reconcile legacy relationship assertions; obtain final taxonomy/migration approval. Relationship UI and Astro ingestion remain on hold.

### Relationship mapping resumption checkpoint — 28 October 2026

- **Verified live state:** 397 Field Guide concepts and 435 structurally valid, Approved/Verified Field Guide Relationships records. A read-only comparison of legacy Field Guide relationship properties against the structured register yields **299 unique unmatched legacy concept pairs**; these are not automatically missing relationships. The set includes at least one previously rejected weak link (Context Effect ↔ Contextual Inquiry).
- **Recovered legacy decisions (27 October conversation, user accepted Batches 1 and 2):** Batch 1 Reconsider: Assistive Technology–Input Modality; Ecosystem Map–Stakeholder Interviews; Elaboration Likelihood Model–Heuristic-Systematic Model; Embodied Cognition–Spatial Cognition; Embodied Interaction–Direct Manipulation. Batch 1 Leave out: Banner Blindness–Information Foraging Theory; Context Effect–Contextual Inquiry; Distinction Bias–Choice-Supportive Bias; Effort Heuristic–Processing Fluency. **Exception:** recovered handoffs conflict on Diffusion of Responsibility–Social Comparison Theory (listed both as Reconsider and Leave out); do not silently decide it. Batch 2 Reconsider: Embodied Interaction–Direct Manipulation; Embodied Interaction–Motor Control; Empathy Mapping–Personas; Endorsement Effect–Social Proof; Endowment Effect–Psychological Ownership. Batch 2 Leave out: Emotional Design–Affect Heuristic; Empathy Gap–Empathy Mapping; Empathy Gap–Contextual Inquiry; Endorsement Effect–Authority Bias; Endowment Effect–Sunk Cost Effect. Embodied Interaction–Direct Manipulation appears in both batches, so deduplicate by unordered concept pair. These are historical editorial dispositions, **not** approval to create Notion relationship records. The complete Batch 2 list was recovered from prior conversation; the conflicting Batch 1 item requires review.
- **Legacy Batch 3 — user-approved decisions (28 October 2026; 15 unique pairs):** **Approve relationship (8):** A/B Testing–Preference Testing; Accessibility–Sludge; Accessibility–WCAG POUR Principles; Accessible Forms–Non-Colour Cues; Attentional Bias–Frequency Illusion; Automation Bias–Human-in-the-Loop; Automation Complacency–Human-on-the-Loop; Availability Heuristic–Representativeness Heuristic. **Leave out (7):** Accessibility–Flexibility and Efficiency of Use; Activation–Funnel; Activation–Product-Led Growth; Affect Heuristic–Negativity Bias; Attentional Bias–F-shaped Pattern (Eye tracking); Authority Bias–Halo Effect; Availability Heuristic–Gambler’s Fallacy. No deferred or ambiguous Batch 3 decisions. These are editorial decisions only: no Notion records were created or modified. Approved pairs require semantic-type classification and separate implementation confirmation.
- **Remaining reconciliation:** 299 unmatched legacy pairs at the read-only baseline; 19 distinct previously decided/conflicted pairs were excluded from Batch 3 selection, leaving 280 candidates before Batch 3. Excluding Batch 3's 15 decisions leaves **265 candidates** for further disposition, assuming unchanged live data; one earlier Batch 1 conflict remains. Recheck live state before subsequent writes.
- **Next action:** classify the eight Batch 3 approved relationships for semantic type and confirm implementation separately; continue legacy reconciliation with the 265 not-yet-dispositioned candidates, excluding prior decisions and the Batch 1 conflict. No Notion relationship writes without explicit approval.
- **Chat-limit handover rule:** record pair-level dispositions in Notion as decisions are approved, and maintain this concise checkpoint in the existing GitHub brief at meaningful stopping points. Each new conversation reads both before proposing work. A final message in an expiring chat must not be required for continuity.

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
| 27 Oct 2026 | Completed structural relationship-register reconciliation and began non-prescriptive 397-concept coverage audit | 392 live records Approved/Verified at that milestone; coverage review pending |\n| 28 Oct 2026 | Rechecked both Notion databases and reconciled the register count to 435; 43 later-created records account for the increase | All 435 pass structural integrity checks; editorial approval provenance for the 43 remains unconfirmed |

## Historical reconciliation note

Prior versions and similarly named Library/Project attachments remain available as historical records. The current relationship rules and known Batches 1–5 decisions have now been reconciled into this file, but this is not a line-by-line audit of every historical draft. Older Notion editorial-conventions milestones describe earlier directed/relevance-heavy methods; its dated current governing rules supersede those workflows. Do not infer that deleting old copies is safe.
