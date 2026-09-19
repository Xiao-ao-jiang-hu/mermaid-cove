# Mermaid Cove

A browser JavaScript renderer for Mermaid diagrams, with a Codex-inspired flowchart appearance and ELK layered layout. Unofficial, not affiliated with OpenAI. **Not published to npm yet.**

- Rounded nodes, generous spacing, pill-shaped edge labels and thin open arrows.
- Layered layout that respects source order when breaking cycles.
- Light/dark palettes, color overrides, SVG output and TypeScript declarations.
- `initialize`, `render`, `run` and `parse`, plus an installer for an existing Mermaid instance.
- Mermaid syntax remains the input. Other diagram families use their native Mermaid renderers with the shared theme.

[中文说明](./README.zh-CN.md)

## Use with a bundler

Until npm publication, clone this repository, run `npm ci && npm run build`, then `npm pack`. Install the resulting tarball in your application:

```sh
npm install ./mermaid-cove-0.1.0.tgz
```

```js
import mermaid from 'mermaid-cove';

mermaid.initialize({ darkMode: true });
const { svg, bindFunctions } = await mermaid.render('diagram-1', `
flowchart LR
  A[Generate] -->|Train| B[World model]
  B --> C[Observe]
  C -->|Calibrate| B
`);
const target = document.querySelector('#diagram');
target.innerHTML = svg;
bindFunctions?.(target);
```

`render(id, source, container?)` returns Mermaid's render result. Use distinct IDs for diagrams that remain in the same document. `initialize()` replaces saved settings; renders retain a snapshot of their settings and are serialized to avoid theme races. The optional container is Mermaid's temporary render container, not an automatic mounting target.

## Direct browser import, without a bundler

Serve the **entire `dist/browser/` directory**, preserving `chunks/`. The entry is an ESM file with lazy-loaded dependencies, like Mermaid's official ESM distribution. It is not a classic `<script src>` global and not a single self-contained file.

```html
<div class="mermaid">flowchart LR
  A[Input] --> B[Model] --> C[Observation]
</div>
<script type="module">
  import mermaid from './dist/browser/mermaid-renderer.esm.min.mjs';
  mermaid.initialize({ darkMode: true });
  await mermaid.run();
</script>
```

Serve over HTTP(S), not `file://`. No remote fonts, CDN requests, Codex installation or runtime services are needed. After npm publication this same browser entry can be hosted by jsDelivr/unpkg; no live CDN URL is claimed here.

## Replace the renderer in an existing Mermaid integration

```js
import mermaid from 'mermaid';
import { install } from 'mermaid-cove/plugin';

install(mermaid, { darkMode: true });
await mermaid.run({ querySelector: '.mermaid' });
```

Call `install` before rendering, and do not subsequently overwrite its config with another `mermaid.initialize`. Lower-level `register`, `createConfig` and `coveFlowchartLayout` exports are available for custom integrations. The plugin shares the host Mermaid singleton; the host owns serialization if it changes themes concurrently. Use the wrapper entry for built-in serialized rendering.

## Options

```js
mermaid.initialize({
  darkMode: false,
  fontFamily: 'system-ui, sans-serif',
  decisionStyle: 'rounded', // default; 'diamond' preserves decision diamonds
  colors: { node: '#eaf5f2', text: '#285e57', line: '#568d85', border: '#c6d8d3', label: '#ffffff' },
  themeVariables: {},
  themeCSS: '', // extra trusted CSS appended to the flowchart theme
  mermaid: { elk: { cycleBreakingStrategy: 'MODEL_ORDER' } },
});
```

Style/configuration options are trusted application input. Mermaid source is processed with `securityLevel: 'strict'` and SVG text labels (`htmlLabels: false`). User diagram directives can still override non-secure Mermaid presentation settings; this package does not strip valid Mermaid syntax or implement Codex's input-repair behavior.

## Compatibility and limits

Pinned and verified pair: Mermaid **11.17.0**, `@mermaid-js/layout-elk` **0.1.9**. Both depend on public npm packages. The layout-loader API is public, but node and label helper objects are internal Mermaid interfaces, so dependency upgrades require browser regression checks. Do not assume compatibility with Mermaid 12 or every Mermaid 11 release.

This is a focused API substitute, not an implementation of every method on the official Mermaid object. It requires a browser DOM for rendering. Native server-side/CLI rendering, PNG export and automatic DOM mutation observation are not included. Existing explicit node styles can override the theme. Rich labels, large nested graphs and additional diagram families need broader compatibility coverage.

The target is similar geometry and appearance, not identical SVG or pixel output. Font metrics and ELK versions affect layout. Edge routing around cycles and nested groups can differ from Codex. Decision diamonds become dashed rounded boxes by default; set `decisionStyle: 'diamond'` when shape semantics matter.

## Development

```sh
npm ci
npm run check
npm run build
npm run dev
```

The demo is at the Vite URL. Open `/tests/browser.html` to run the browser regression suite; add `?entry=browser` to exercise the built direct-import distribution. Open `/tests/plugin.html` to check the existing-Mermaid integration. Build the distributable first for those tests. `npm run build:demo` builds a static demo.

## Distribution and provenance

MIT for this project's source; dependency licenses remain their own. See `THIRD_PARTY_NOTICES.md` (generated during build). Behavior and dimensions were informed by inspecting the installed Codex App; the implementation here uses public Mermaid/ELK packages and contains no copied App bundle, App assets or private runtime dependency. This is **not** a claim of an independently isolated clean-room process.

GitHub source is distributed under MIT; npm publication is a separate release step. `npm publish` runs syntax checks, builds both distributions and checks types automatically through `prepublishOnly`. Review `npm publish --dry-run`, then run `npm login --registry=https://registry.npmjs.org/` and `npm publish`. Complete any npm browser/2FA prompts locally. Do not include `node_modules`, unpacked Codex resources or local audit data in the public repository.
