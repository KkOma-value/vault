# Vault Atlas Design QA

- Source visual truth: `/Users/hb41142/vault/vault-atlas-site/reference-option-3.png`
- Browser implementation screenshot: `/Users/hb41142/vault/vault-atlas-site/implementation-home-1440x1024-pass2.png`
- Combined comparison evidence: `/Users/hb41142/vault/vault-atlas-site/qa-comparison-home-pass2.png`
- Article reading evidence: `/Users/hb41142/vault/vault-atlas-site/implementation-article-1440x1024.png`
- Article graph evidence: `/Users/hb41142/vault/vault-atlas-site/implementation-article-graph-pass2.png`
- Mobile evidence: `/Users/hb41142/vault/vault-atlas-site/implementation-home-mobile-390x844.png`
- Desktop viewport: 1440 × 1024 CSS px
- Mobile viewport: 390 × 844 CSS px
- Source pixels: 1440 × 1024
- Implementation pixels: 1440 × 1024
- Device scale factor: 1
- Density normalization: none required; source and implementation use identical pixels and CSS viewport
- Compared state: homepage with Graph Engineering selected; dark theme; search closed

## Full-view comparison evidence

The source and implementation are present together at original density in `qa-comparison-home-pass2.png`. The implementation preserves the source visual's three-column observatory, numbered field rail, Graph Engineering focus, lime selection marker, cyan technical lines, dark scientific-instrument palette, related-domain panel, first-viewport article list, and lower global-graph continuation. The field count changes from the mock's illustrative 18 to the vault's current 19, and the field names use the actual vault taxonomy; these are intentional content corrections rather than design drift.

## Required fidelity surfaces

- Fonts and typography: Noto Sans SC and IBM Plex Mono reproduce the source's contemporary Chinese grotesk plus technical-index contrast. Display scale, small coordinate labels, compact row labels, and article reading line length match the intended hierarchy without clipping.
- Spacing and layout rhythm: desktop grid proportions, 66 px masthead, compact 30 px field rows, hard dividers, square surfaces, and dense first viewport track the selected visual. Mobile collapses the field rail into a horizontal selector and preserves the reading hierarchy.
- Colors and visual tokens: graphite/navy surfaces, mineral off-white article paper, lime selection, cyan graph structure, slate secondary nodes, and restrained coral metadata accents remain consistent. Contrast is readable in both dark and paper surfaces.
- Image quality and asset fidelity: the selected design contains no photographic or raster artwork. Interface icons use one consistent Phosphor family. Knowledge maps are real interactive canvas graphs rather than decorative placeholders or handcrafted SVG substitutes.
- Copy and content: all visible domain names, article titles, dates, summaries, counts, and relationships come from the current vault. Search results and route titles match their records.

## Focused-region comparison evidence

No additional crop was required because both complete desktop screenshots are 1440 × 1024 at 1:1 density, and the important fine-detail regions—the masthead, selected field, article rows, relation panel, and lower graph preview—remain readable in the combined original-size comparison. Separate original-density screenshots verify the article hero and article-local graph, which were product requirements beyond the homepage source visual.

## Interaction and browser verification

- Opened the browser-rendered homepage and confirmed the current vault statistics and Graph Engineering field.
- Opened global search, searched for `安全`, and confirmed six ranked domain/article/report results.
- Navigated from search to the AI Security domain, then into the Codex Security article.
- Confirmed the article table of contents, two rendered tables, source metadata, related-content section, and bottom local knowledge graph.
- Checked desktop 1440 × 1024 and mobile 390 × 844 layouts.
- Browser console checked after homepage, domain, article, and responsive states: no errors or warnings.

## Comparison history

### Pass 1 — blocked

- [P1] Knowledge-graph labels scaled with the force-layout zoom and became oversized in the compact relation graph and article-local graph.
  - Evidence: `implementation-home-1440x1024.png` and `implementation-article-graph-1440x1024.png`.
  - Impact: labels collided with nodes and changed the source visual's precise instrument-like density.
  - Fix: compact selected-node labels were moved inside the active node; all non-compact labels now use inverse zoom scaling, bounded lengths, and scale-aware offsets.

### Pass 2 — passed

- Post-fix evidence: `qa-comparison-home-pass2.png` and `implementation-article-graph-pass2.png`.
- The earlier P1 overlap is removed. Graph labels remain legible and restrained at both compact and article scales.
- No actionable P0, P1, or P2 findings remain.

### Production routing — passed

- Verified Sites-compatible query routing from the homepage into a processed Wiki article.
- Direct article state loads from the root document, preserving refresh and share behavior on static production hosting.
- No browser console errors or warnings were observed after navigation.

## Follow-up polish

- [P3] The global preview intentionally uses the live force layout, so its exact node positions differ from the static mock while retaining the same density, color system, and exploratory behavior.

## Implementation checklist

- [x] Match selected visual system and first-viewport hierarchy.
- [x] Use current vault content and counts.
- [x] Make search, domain navigation, article navigation, and graph navigation functional.
- [x] Include a full graph at the homepage bottom and a local graph at article bottoms.
- [x] Verify desktop, mobile, console, and core navigation.

final result: passed
