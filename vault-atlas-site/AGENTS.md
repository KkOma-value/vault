# Prototype Instructions

Run the local server yourself and open the preview in the browser available to this environment. Do not give the user server-start instructions when you can run it.

Before making substantial visual changes, use the Product Design plugin's `get-context` skill when the visual source is unclear or no longer matches the current goal. When the user gives durable prototype-specific design feedback, preferences, or decisions, record them in `AGENTS.md`.

When implementing from a selected generated mock, treat that image as the source of truth for layout, component anatomy, density, spacing, color, typography, visible content, and hierarchy.

## Durable design decisions

- Shopify Editions Winter'26 ("The Renaissance Edition") is the narrative-motion reference (user-selected, 2026-10-16). Port its *devices*, not its skin: giant condensed display word + serif-italic accent line + roman-numeral chapter index with dotted leaders + scroll parallax + faint da Vinci line overlay. Keep Vault Atlas dark instrument theme; do NOT flip to Shopify cream paper.
- Fonts are system平替 (no new deps): display word uses Noto Sans SC 800 tight tracking; serif accent uses Georgia/Times italic. Commercial originals (PP Neue Montreal / HWCigars) are not bundled.
- NarrativeHero lives in `src/NarrativeHero.jsx` (+ `.narrative-*` styles); Home uses giant "Knowledge Renaissance", Domain pages use the domain short title. No WebGL: scroll effect is rAF transform/opacity only, honoring `prefers-reduced-motion`.

Build app UI in `src/`. Keep `.openai/hosting.json`, `worker/index.js`, `scripts/prepare-sites-build.mjs`, and `tests/sites-worker.test.mjs` intact so the same local prototype can be handed to Sites. Before a Sites handoff, run `npm run build` and `npm run test:sites`; the build must leave `dist/client/index.html`, `dist/server/index.js`, and `dist/.openai/hosting.json`.
